<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ApiArchitectureTest extends TestCase
{
    /**
     * Test successful /api/v1/ping response structure.
     */
    public function test_api_ping_response_structure(): void
    {
        $response = $this->getJson('/api/v1/ping');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'data' => [
                         'status'
                     ],
                     'meta'
                 ])
                 ->assertJson([
                     'success' => true,
                     'message' => 'pong',
                     'data' => [
                         'status' => 'ok'
                     ]
                 ]);
    }

    /**
     * Test 404 response structure for a missing route.
     */
    public function test_api_not_found_response_structure(): void
    {
        $response = $this->getJson('/api/v1/missing-route-that-does-not-exist');

        $response->assertStatus(404)
                 ->assertJsonStructure([
                     'success',
                     'message'
                 ])
                 ->assertJson([
                     'success' => false,
                     'message' => 'Not Found.'
                 ]);
    }
}
