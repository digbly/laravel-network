<?php

namespace App\Http\Middleware;

use App\Facades\Network;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InitWebsite
{
    /**
     * Initialize the network website context from the route parameter.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $website = $request->route('website');

        if ($website !== null) {
            Network::init($website);
        }

        return $next($request);
    }
}
