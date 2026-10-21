<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);
        $user = User::where('email', mb_strtolower($data['email']))->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => 'Неверный e-mail или пароль.']);
        }

        return ['token' => $user->createToken('admin', ['admin'], now()->addDays(30))->plainTextToken, 'user' => $this->user($user)];
    }

    public function me(Request $request)
    {
        return ['user' => $this->user($request->user())];
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return ['ok' => true];
    }

    public function password(Request $request)
    {
        $data = $request->validate([
            'current_password' => ['required', 'current_password:sanctum'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);
        $request->user()->update(['password' => $data['password']]);

        return ['ok' => true];
    }

    private function user(User $user): array
    {
        return ['id' => $user->id, 'name' => $user->name, 'email' => $user->email];
    }
}
