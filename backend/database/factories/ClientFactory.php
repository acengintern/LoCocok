<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Client>
 */
class ClientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'contact' => fake()->name(),
            'email' => fake()->companyEmail(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'pic_ae_id' => User::factory(),
            'pic_sms_id' => User::factory(),
            'status' => fake()->randomElement(['ACTIVE', 'INACTIVE', 'PROSPECT']),
            'notes' => fake()->paragraph(),
        ];
    }
}
