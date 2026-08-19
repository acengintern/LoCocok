<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\ProjectType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_code' => fake()->unique()->numerify('PRJ-####'),
            'client_id' => Client::factory(),
            'name' => fake()->sentence(3),
            'project_type_id' => ProjectType::factory(),
            'ae_id' => User::factory(),
            'sms_id' => User::factory(),
            'cd_id' => User::factory(),
            'priority' => fake()->randomElement(['LOW', 'MID', 'HIGH', 'URGENT']),
            'start_date' => fake()->date(),
            'end_date' => fake()->date(),
            'actual_end_date' => null,
            'status' => fake()->randomElement(['BRIEF_RECEIVED', 'CONTENT_PLANNING', 'SCRIPT_READY', 'DESIGN', 'EDITING', 'QC_INTERNAL', 'CLIENT_REVIEW', 'REVISION', 'APPROVED', 'PUBLISHED', 'DONE', 'HOLD', 'EXPIRED', 'OVERTIME', 'CANCELLED']),
            'notes' => fake()->paragraph(),
        ];
    }
}
