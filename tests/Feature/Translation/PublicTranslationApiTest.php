<?php

namespace Tests\Feature\Translation;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicTranslationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_namespaces_without_authentication(): void
    {
        $this->getJson('/api/v1/translations/en/common')
            ->assertOk()
            ->assertJsonPath('layout.brand', 'SiteStore')
            ->assertJsonPath('topbar.openMenu', 'Open navigation menu');

        $this->getJson('/api/v1/translations/en/admin')
            ->assertOk()
            ->assertJsonPath('nav.dashboard', 'Dashboard')
            ->assertJsonPath('users.title', 'Users')
            ->assertJsonPath('media.title', 'Media Library');

        $this->getJson('/api/v1/translations/en/auth')
            ->assertOk()
            ->assertJsonPath('login.title', 'Welcome back');

        $this->getJson('/api/v1/translations/en/blog')
            ->assertOk()
            ->assertJsonPath('posts.title', 'Blog Posts')
            ->assertJsonPath('nav.blogPosts', 'Blog Posts');

        $this->getJson('/api/v1/translations/en/network')
            ->assertOk()
            ->assertJsonPath('networkAdmin.dashboard.title', 'Network dashboard');
    }

    public function test_it_returns_vietnamese_translations(): void
    {
        $this->getJson('/api/v1/translations/vi/auth')
            ->assertOk()
            ->assertJsonPath('login.title', 'Chào mừng trở lại');

        $this->getJson('/api/v1/translations/vi/blog')
            ->assertOk()
            ->assertJsonPath('posts.title', 'Bài viết');
    }

    public function test_it_returns_not_found_for_an_unknown_locale_or_namespace(): void
    {
        $this->getJson('/api/v1/translations/xx/admin')->assertNotFound();
        $this->getJson('/api/v1/translations/en/unknown')->assertNotFound();
    }
}
