<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\SiteSettings;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function show()
    {
        return ['data' => SiteSettings::all()];
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'group' => ['required', 'string', 'in:'.implode(',', array_keys(SiteSettings::defaults()))],
            'value' => ['required', 'array'],
        ]);

        return ['data' => SiteSettings::update([$data['group'] => $data['value']])];
    }
}
