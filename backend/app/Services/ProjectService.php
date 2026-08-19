<?php

namespace App\Services;

use App\Models\Project;

class ProjectService
{
    /**
     * Create a new project and handle related logic.
     */
    public function createProject(array $data): Project
    {
        // For now, just create the project. 
        // We will use this service to create default financial records later.
        $project = Project::create($data);

        return $project;
    }
}
