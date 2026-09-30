<?php

namespace Modules\Admin\Tests\Feature\Admin;

use App\Contracts\Setting as SettingContract;
use App\Enums\WebsiteStatus;
use App\Models\Website;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Modules\Admin\Tests\TestCase;
use Modules\Auth\Models\User;

class SettingsPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->artisan('permission:generate');
    }

    protected function makeWebsite(): Website
    {
        return Website::create([
            'title' => 'Site '.uniqid(),
            'subdomain' => 'site-'.uniqid(),
            'status' => WebsiteStatus::ACTIVE,
            'user_id' => User::factory()->create()->id,
        ]);
    }

    public function test_super_admin_can_view_settings_page(): void
    {
        $admin = User::factory()->create(['is_super_admin' => true]);
        $website = $this->makeWebsite();

        $this->actingAs($admin, 'web')
            ->get('/admin/'.$website->id.'/settings')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin::settings/Index', false)
                ->has('settings')
                ->has('locales')
            );
    }

    public function test_super_admin_can_update_settings(): void
    {
        $admin = User::factory()->create(['is_super_admin' => true]);
        $website = $this->makeWebsite();

        $this->actingAs($admin, 'web')
            ->put('/admin/'.$website->id.'/settings', [
                'sitename' => 'My Site',
                'user_registration' => true,
            ])
            ->assertRedirect();

        $settings = app(SettingContract::class);
        $this->assertSame('My Site', $settings->get('sitename'));
        $this->assertTrue($settings->boolean('user_registration'));
    }

    public function test_user_without_permission_is_forbidden(): void
    {
        $user = User::factory()->create();
        $website = $this->makeWebsite();
        $website->users()->attach($user);

        $this->actingAs($user, 'web')
            ->get('/admin/'.$website->id.'/settings')
            ->assertForbidden();
    }
}
