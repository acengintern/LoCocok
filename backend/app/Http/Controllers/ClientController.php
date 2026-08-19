<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Http\Resources\ClientResource;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ClientController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Client::class);

        // Optional: filter clients by user if they are not admin
        // But policy viewAny just checks 'view' permission.
        $clients = Client::with(['picAe', 'picSms'])->latest()->get();

        return $this->successResponse(
            ClientResource::collection($clients),
            'Clients retrieved successfully.'
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClientRequest $request)
    {
        $this->authorize('create', Client::class);

        $client = Client::create($request->validated());
        $client->load(['picAe', 'picSms']);

        return $this->successResponse(
            new ClientResource($client),
            'Client created successfully.',
            201
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        $this->authorize('view', $client);

        $client->load(['picAe', 'picSms']);

        return $this->successResponse(
            new ClientResource($client),
            'Client retrieved successfully.'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClientRequest $request, Client $client)
    {
        $this->authorize('update', $client);

        $client->update($request->validated());
        $client->load(['picAe', 'picSms']);

        return $this->successResponse(
            new ClientResource($client),
            'Client updated successfully.'
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        $this->authorize('delete', $client);

        $client->delete();

        return $this->successResponse(
            null,
            'Client deleted successfully.'
        );
    }
}
