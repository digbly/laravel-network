<?php

if (! function_exists('is_json')) {
    function is_json(mixed $value): bool
    {
        if (! is_string($value) || $value === '') {
            return false;
        }

        try {
            json_decode($value, true, 512, JSON_THROW_ON_ERROR);

            return true;
        } catch (Throwable) {
            return false;
        }
    }
}

if (! function_exists('website_id')) {
    function website_id(): int|string|null
    {
        return config('app.website_id');
    }
}
