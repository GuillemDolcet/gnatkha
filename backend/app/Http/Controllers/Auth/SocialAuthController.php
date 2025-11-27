<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Repositories\SocialProvidersRepository;
use App\Repositories\UsersRepository;
use Illuminate\Support\Facades\Auth;
use Throwable;

class SocialAuthController extends Controller
{
    /**
     * Users repository instance.
     *
     * @param  UsersRepository  $usersRepository
     */
    protected UsersRepository $usersRepository;

    /**
     * SocialProviders repository instance.
     *
     * @param  SocialProvidersRepository  $socialProvidersRepository
     */
    protected SocialProvidersRepository $socialProvidersRepository;

    /**
     * Class constructor.
     *
     * @return void
     */
    public function __construct(UsersRepository $usersRepository, SocialProvidersRepository $socialProvidersRepository)
    {
        $this->usersRepository = $usersRepository;

        $this->socialProvidersRepository = $socialProvidersRepository;
    }

    /**
     * All Social Providers callback
     *
     * @throws Throwable
     */
    public function callback(string $social): \Illuminate\Contracts\Routing\ResponseFactory|\Illuminate\Http\Response
    {
        try {
            $provider = $this->socialProvidersRepository->findBy(['name' => $social]);

            if (! $provider) {
                return $this->returnAuthError("$social not supported.");
            }

            $serviceClass = 'App\\Services\\SocialProviders\\'.ucfirst($provider->name).'Service';

            /** @var \App\Concerns\Contracts\SocialProvidersAuthInterface $service */
            $service = app($serviceClass);

            $data = $service->callback()->toArray(request());

            $user = $this->usersRepository->findByEmail($data['email']);

            if ($user) {
                $user = $this->usersRepository->update($user, $data, $provider);
            } else {
                $user = $this->usersRepository->create($data, $provider);
            }

            if (!$user) {
                return $this->returnAuthError("Error on login with the user.");
            }

            $user->markEmailAsVerified();

            Auth::login($user);

            return $this->returnAuthSuccess();
        } catch (Throwable $e) {
            \Log::error('Social auth error: ' . $e->getMessage());
            return $this->returnAuthError('An error occurred during authentication.');
        }
    }

    /**
     * Return success HTML that sends message to parent window
     */
    private function returnAuthSuccess(): \Illuminate\Contracts\Routing\ResponseFactory|\Illuminate\Http\Response
    {
        $html = "
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Authentication Success</title>
                </head>
                <body>
                    <script>
                        window.opener.postMessage({
                            type: 'auth-success',
                        }, window.location.origin);
                        window.close();
                    </script>
                    <p>Authentication successful. This window will close automatically.</p>
                </body>
            </html>
        ";

        return response($html, 200)->header('Content-Type', 'text/html');
    }

    /**
     * Return error HTML that sends message to parent window
     */
    private function returnAuthError(string $error): \Illuminate\Contracts\Routing\ResponseFactory|\Illuminate\Http\Response
    {
        $html = "
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Authentication Error</title>
                </head>
                <body>
                    <script>
                        window.opener.postMessage({
                            type: 'auth-error',
                            error: '{$error}'
                        }, window.location.origin);
                        window.close();
                    </script>
                    <p>Authentication failed: {$error}</p>
                    <p>This window will close automatically.</p>
                </body>
            </html>
        ";

        return response($html, 400)->header('Content-Type', 'text/html');
    }
}
