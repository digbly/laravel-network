<?php

namespace Modules\Network\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restricts network-level management endpoints to super admins.
 */
class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user('api')?->isSuperAdmin()) {
            abort(403, 'This action requires super admin access.');
        }

        return $next($request);
    }
}
