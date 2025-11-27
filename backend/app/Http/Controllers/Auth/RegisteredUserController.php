<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Notifications\VerifyEmailNotification;
use App\Repositories\UsersRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class RegisteredUserController extends Controller
{
    /**
     * Users repository instance.
     *
     * @param  UsersRepository  $usersRepository
     */
    protected UsersRepository $usersRepository;

    /**
     * Class constructor.
     *
     * @return void
     */
    public function __construct(UsersRepository $usersRepository)
    {
        $this->usersRepository = $usersRepository;
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(RegisterRequest $request): Response|JsonResponse
    {
        $user = $this->usersRepository->create($request->validated());

        if ($user) {
            $locale = $request->input('locale', app()->getLocale());

            $user->notify((new VerifyEmailNotification)->locale($locale));

            Auth::login($user);

            return response()->noContent();
        }

        return response()->json([
            'code' => 'error_create_user',
            'message' => 'An error occurred while creating your account. Please try again later.',
        ], 500);
    }
}
