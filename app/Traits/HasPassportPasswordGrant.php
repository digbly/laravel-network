<?php

namespace App\Traits;

use App\Models\User;
use GuzzleHttp\Psr7\Response as Psr7Response;
use JsonException;
use Laravel\Passport\Http\Controllers\ConvertsPsrResponses;
use League\OAuth2\Server\AuthorizationServer;
use League\OAuth2\Server\Exception\OAuthServerException;
use Psr\Http\Message\ServerRequestInterface;
use stdClass;

trait HasPassportPasswordGrant
{
    use ConvertsPsrResponses;

    /**
     * Generate Password Grant Token
     *
     * @param  array<string>|string  $scopes
     *
     * @throws JsonException
     * @throws OAuthServerException
     */
    public static function generatePasswordGrantToken(string $username, string $password, array|string $scopes = '*'): stdClass
    {
        ['client_id' => $clientId, 'client_secret' => $clientSecret] = User::resolvePasswordClient();

        $requestData = [
            'grant_type' => 'password',
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'username' => $username,
            'password' => $password,
            'scope' => is_array($scopes) ? implode(' ', $scopes) : $scopes,
        ];

        $serverRequest = app(ServerRequestInterface::class)->withParsedBody($requestData);

        $response = (new static)->convertResponse(
            app(AuthorizationServer::class)->respondToAccessTokenRequest($serverRequest, new Psr7Response)
        );

        return json_decode($response->getContent(), false, 512, JSON_THROW_ON_ERROR);
    }
}
