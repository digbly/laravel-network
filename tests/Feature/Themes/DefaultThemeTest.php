<?php

namespace Tests\Feature\Themes;

use App\Themes\FileRepository;
use App\Themes\ThemeManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Blog\Enums\CommentStatus;
use Modules\Blog\Enums\PostStatus;
use Modules\Blog\Models\Category;
use Modules\Blog\Models\Comment;
use Modules\Blog\Models\Post;
use Tests\TestCase;
use Themes\Default\Providers\ThemeServiceProvider;

class DefaultThemeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->register(ThemeServiceProvider::class);

        $theme = $this->app->make(FileRepository::class)->findOrFail('Default');

        $this->app->make(ThemeManager::class)->activate($theme);
    }

    protected function makePost(array $translation = [], array $attributes = []): Post
    {
        $post = Post::factory()->create($attributes);

        $post->translations()->updateOrCreate(
            ['locale' => 'en'],
            array_merge([
                'locale' => 'en',
                'title' => 'Default title',
                'slug' => 'default-'.uniqid(),
                'content' => '<p>Default content</p>',
            ], $translation)
        );

        return $post;
    }

    protected function makeCategory(array $translation = []): Category
    {
        $category = Category::factory()->create();

        $category->translations()->updateOrCreate(
            ['locale' => 'en'],
            array_merge([
                'locale' => 'en',
                'name' => 'Default',
                'slug' => 'default-'.uniqid(),
            ], $translation)
        );

        return $category;
    }

    public function test_home_lists_published_posts_with_pagination(): void
    {
        foreach (range(1, 10) as $index) {
            $number = str_pad((string) $index, 2, '0', STR_PAD_LEFT);
            $this->makePost(['title' => "Article {$number}", 'slug' => "article-{$number}"]);
        }

        $this->makePost(
            ['title' => 'Hidden draft', 'slug' => 'hidden-draft'],
            ['status' => PostStatus::Draft],
        );

        $pageOne = $this->get('/')->assertOk();
        $pageOne->assertSee('Article 01')
            ->assertDontSee('Hidden draft')
            ->assertSee('aria-label="Pagination"', false);

        // Nine published posts per page: 9 cards on page 1, the remaining 1 on page 2.
        $this->assertSame(9, substr_count($pageOne->getContent(), 'hover:-translate-y-0.5'));

        $pageTwo = $this->get('/?page=2')->assertOk();
        $pageTwo->assertSee('Article 10');
        $this->assertSame(1, substr_count($pageTwo->getContent(), 'hover:-translate-y-0.5'));
    }

    public function test_post_page_shows_content_and_only_approved_comments(): void
    {
        $post = $this->makePost(['title' => 'Read me', 'slug' => 'read-me', 'content' => '<p>Body copy</p>']);

        Comment::factory()->create([
            'post_id' => $post->getKey(),
            'content' => 'Approved comment',
            'status' => CommentStatus::Approved,
        ]);

        Comment::factory()->create([
            'post_id' => $post->getKey(),
            'content' => 'Pending comment',
            'status' => CommentStatus::Pending,
        ]);

        $this->get('/posts/read-me')
            ->assertOk()
            ->assertSee('Read me')
            ->assertSee('Body copy', false)
            ->assertSee('Approved comment')
            ->assertDontSee('Pending comment');
    }

    public function test_category_page_lists_its_posts(): void
    {
        $category = $this->makeCategory(['name' => 'News', 'slug' => 'news']);

        $inCategory = $this->makePost(['title' => 'In category', 'slug' => 'in-category']);
        $inCategory->categories()->sync([$category->getKey()]);

        $this->get('/categories/news')
            ->assertOk()
            ->assertSee('News')
            ->assertSee('In category');
    }

    public function test_category_page_ignores_drafts(): void
    {
        $category = $this->makeCategory(['name' => 'News', 'slug' => 'news']);

        $draft = $this->makePost(
            ['title' => 'Draft in category', 'slug' => 'draft-in-category'],
            ['status' => PostStatus::Draft],
        );
        $draft->categories()->sync([$category->getKey()]);

        $this->get('/categories/news')
            ->assertOk()
            ->assertDontSee('Draft in category');
    }

    public function test_search_filters_posts_by_title(): void
    {
        $this->makePost(['title' => 'Tailwind tricks', 'slug' => 'tailwind-tricks']);
        $this->makePost(['title' => 'Blade basics', 'slug' => 'blade-basics']);

        $this->get('/search?q=Tailwind')
            ->assertOk()
            ->assertSee('Tailwind tricks')
            ->assertDontSee('No articles matched your search.');

        $this->get('/search?q=zzz-no-match')
            ->assertOk()
            ->assertSee('No articles matched your search.');
    }

    public function test_guest_can_submit_a_comment(): void
    {
        $post = $this->makePost(['title' => 'Comment here', 'slug' => 'comment-here']);

        $this->post("/posts/{$post->getKey()}/comments", [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'content' => 'Nice article!',
        ])->assertRedirect(route('default.posts.show', 'comment-here'));

        $this->assertDatabaseHas('comments', [
            'post_id' => $post->getKey(),
            'name' => 'Jane Doe',
            'content' => 'Nice article!',
            'status' => CommentStatus::Pending->value,
        ]);
    }

    public function test_comment_requires_valid_input(): void
    {
        $post = $this->makePost(['title' => 'Validated', 'slug' => 'validated']);

        $this->post("/posts/{$post->getKey()}/comments", [
            'name' => '',
            'email' => 'not-an-email',
            'content' => '',
        ])->assertSessionHasErrors(['name', 'email', 'content']);

        $this->assertDatabaseCount('comments', 0);
    }

    public function test_unknown_post_uses_themed_404(): void
    {
        $this->get('/posts/does-not-exist')
            ->assertNotFound()
            ->assertSee('Back to home');
    }
}
