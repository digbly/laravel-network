<?php

namespace App\Http\Controllers;

use App\Support\AdminTranslations;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\App;
use OpenApi\Attributes as OA;

class TranslationController extends Controller
{
    #[OA\Get(
        path: '/api/v1/translations/{locale}/{namespace}',
        summary: 'Show an admin SPA translation namespace for a locale',
        operationId: 'translations.show',
        tags: ['Translations'],
        parameters: [
            new OA\Parameter(name: 'locale', in: 'path', required: true, schema: new OA\Schema(type: 'string', example: 'en')),
            new OA\Parameter(name: 'namespace', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['common', 'admin', 'auth', 'blog', 'network'])),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Translation tree for the requested namespace',
                content: new OA\JsonContent(type: 'object')
            ),
            new OA\Response(response: 404, description: 'Locale or namespace not found'),
        ]
    )]
    public function __invoke(string $locale, string $namespace, AdminTranslations $translations): JsonResponse
    {
        abort_unless(array_key_exists($namespace, $translations->namespaces()), 404);
        abort_unless(in_array($locale, $translations->locales(), true), 404);

        $translations->registerNamespaces();

        App::setLocale($locale);

        $lines = trans($translations->translationKey($namespace));

        return response()->json(is_array($lines) ? $lines : []);
    }
}
