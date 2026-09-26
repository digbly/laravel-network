<?php

namespace Tests\Feature\Permission;

use App\Enums\WebsiteStatus;
use App\Models\Website;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Passport\Passport;
use Modules\Auth\Models\User;
use Tests\TestCase;

class UngeneratedPermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_route_with_ungenerated_permission_is_forbidden_not_an_error(): void
    {
        $website = Website::create([
            'title' => 'Test Site',
            'subdomain' => 'test-site',
            'status' => WebsiteStatus::ACTIVE,
            'user_id' => User::factory()->create()->id,
        ]);

        Passport::actingAs(User::factory()->create());

        $this->getJson("/api/v1/admin/websites/{$website->id}/menus")->assertForbidden();
    }
}
