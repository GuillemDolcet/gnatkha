<?php

namespace Database\Seeders;

use App\Models\SocialProvider;
use App\Repositories\SocialProvidersRepository;
use Illuminate\Database\Seeder;

class ProviderSeeder extends Seeder
{
    /**
     * SocialProviders repository instance.
     *
     * @param  SocialProvidersRepository  $providersRepository
     */
    protected SocialProvidersRepository $socialProvidersRepository;

    /**
     * Class constructor.
     *
     * @return void
     */
    public function __construct(SocialProvidersRepository $socialProvidersRepository)
    {
        $this->socialProvidersRepository = $socialProvidersRepository;
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (SocialProvider::defaults() as $name) {
            $this->socialProvidersRepository->create(['name' => $name]);
        }
    }
}
