<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateUserCommand extends Command
{
    protected $signature = 'make:user
        {--name= : User name}
        {--email= : User email}
        {--password= : User password}
        {--super-admin : Mark as super admin}';

    protected $description = 'Create a new user interactively';

    public function handle(): int
    {
        $name = $this->option('name') ?? $this->ask('Name');
        $email = $this->option('email') ?? $this->ask('Email', fn ($v) => filter_var($v, FILTER_VALIDATE_EMAIL) ? true : 'Invalid email');
        $password = $this->option('password') ?? $this->secret('Password');

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'is_super_admin' => $this->option('super-admin'),
            'email_verified_at' => now(),
            'role' => $this->option('super-admin') ? User::ROLE_ADMIN : User::ROLE_USER,
        ]);

        $this->info("User [{$user->email}] created successfully (id: {$user->id})");

        return Command::SUCCESS;
    }
}
