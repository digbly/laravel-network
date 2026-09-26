<?php

namespace Tests\Feature\Menu;

use App\Models\Menus\Menu;
use App\Models\Menus\MenuItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Passport\Passport;
use Modules\Auth\Models\User;
use Tests\TestCase;

class MenuBuilderApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('permission:sync');

        Passport::actingAs($this->adminUser());
    }

    protected function adminUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        return $user;
    }

    public function test_index_requires_authentication(): void
    {
        $this->app['auth']->forgetGuards();

        $this->getJson('/api/v1/admin/menus')->assertUnauthorized();
    }

    public function test_index_forbids_user_without_permission(): void
    {
        Passport::actingAs(User::factory()->create());

        $this->getJson('/api/v1/admin/menus')->assertForbidden();
    }

    public function test_store_creates_menu(): void
    {
        $response = $this->postJson('/api/v1/admin/menus', ['name' => 'Main Menu']);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Main Menu');

        $this->assertDatabaseHas('menus', ['name' => 'Main Menu']);
    }

    public function test_store_validates_name(): void
    {
        $this->postJson('/api/v1/admin/menus', ['name' => ''])
            ->assertJsonValidationErrors('name');
    }

    public function test_update_syncs_items_tree_with_translations(): void
    {
        $menu = Menu::create(['name' => 'Main']);
        $menu->items()->create(['box_key' => 'custom', 'link' => '/stale', 'display_order' => 0]);

        $content = json_encode([
            ['label' => 'Home', 'link' => '/', 'is_home' => 1],
            [
                'label' => 'About',
                'link' => '/about',
                'children' => [
                    ['label' => 'Team', 'link' => '/about/team'],
                ],
            ],
        ]);

        $response = $this->putJson("/api/v1/admin/menus/{$menu->id}", [
            'name' => 'Main Updated',
            'content' => $content,
            'locale' => 'en',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Main Updated')
            ->assertJsonCount(2, 'data.items');

        $menu->refresh();
        $this->assertSame('Main Updated', $menu->name);
        $this->assertSame(3, $menu->items()->count());
        $this->assertDatabaseMissing('menu_items', ['link' => '/stale']);

        $about = $menu->items()->where('box_key', 'custom')->where('link', '/about')->firstOrFail();
        $this->assertSame(1, $about->children()->count());
        $this->assertSame('Team', $about->children()->first()->label);
        $this->assertDatabaseHas('menu_item_translations', [
            'menu_item_id' => $about->id,
            'locale' => 'en',
            'label' => 'About',
        ]);
    }

    public function test_show_returns_items_tree(): void
    {
        $menu = Menu::create(['name' => 'Main']);
        $root = $menu->items()->create(['box_key' => 'custom', 'link' => '/', 'display_order' => 1]);
        $root->translateOrNew('en')->label = 'Home';
        $root->save();

        $this->getJson("/api/v1/admin/menus/{$menu->id}")
            ->assertOk()
            ->assertJsonPath('data.items.0.label', 'Home')
            ->assertJsonPath('data.items.0.is_custom', true);
    }

    public function test_destroy_deletes_menu(): void
    {
        $menu = Menu::create(['name' => 'Main']);

        $this->deleteJson("/api/v1/admin/menus/{$menu->id}")->assertOk();

        $this->assertDatabaseMissing('menus', ['id' => $menu->id]);
        $this->assertSame(0, MenuItem::query()->count());
    }
}
