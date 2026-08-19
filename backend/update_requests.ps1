$requests = @(
    @{ File = "app/Http/Requests/StoreTeamRequest.php"; Table = "teams"; NameRule = "required|string|max:255|unique:teams,name"; OtherRules = "'description' => 'nullable|string'," }
    @{ File = "app/Http/Requests/UpdateTeamRequest.php"; Table = "teams"; NameRule = "required|string|max:255|unique:teams,name,$this->team->id"; OtherRules = "'description' => 'nullable|string'," }
    @{ File = "app/Http/Requests/StoreProjectTypeRequest.php"; Table = "project_types"; NameRule = "required|string|max:255|unique:project_types,name"; OtherRules = "'code' => 'nullable|string|max:50', 'description' => 'nullable|string'," }
    @{ File = "app/Http/Requests/UpdateProjectTypeRequest.php"; Table = "project_types"; NameRule = "required|string|max:255|unique:project_types,name,$this->project_type->id"; OtherRules = "'code' => 'nullable|string|max:50', 'description' => 'nullable|string'," }
    @{ File = "app/Http/Requests/StoreOutputTypeRequest.php"; Table = "output_types"; NameRule = "required|string|max:255|unique:output_types,name"; OtherRules = "'category' => 'nullable|string|max:100'," }
    @{ File = "app/Http/Requests/UpdateOutputTypeRequest.php"; Table = "output_types"; NameRule = "required|string|max:255|unique:output_types,name,$this->output_type->id"; OtherRules = "'category' => 'nullable|string|max:100'," }
    @{ File = "app/Http/Requests/StoreTaskTypeRequest.php"; Table = "task_types"; NameRule = "required|string|max:255|unique:task_types,name"; OtherRules = "'code' => 'nullable|string|max:50'," }
    @{ File = "app/Http/Requests/UpdateTaskTypeRequest.php"; Table = "task_types"; NameRule = "required|string|max:255|unique:task_types,name,$this->task_type->id"; OtherRules = "'code' => 'nullable|string|max:50'," }
    @{ File = "app/Http/Requests/StoreFileTypeRequest.php"; Table = "file_types"; NameRule = "required|string|max:255|unique:file_types,name"; OtherRules = "'code' => 'nullable|string|max:50'," }
    @{ File = "app/Http/Requests/UpdateFileTypeRequest.php"; Table = "file_types"; NameRule = "required|string|max:255|unique:file_types,name,$this->file_type->id"; OtherRules = "'code' => 'nullable|string|max:50'," }
)

foreach ($req in $requests) {
    $content = Get-Content $req.File -Raw
    $content = $content -replace 'public function authorize\(\): bool\s*{\s*return false;\s*}', "public function authorize(): bool
    {
        return true;
    }"
    $rules = "'name' => '" + $req.NameRule + "',
            " + $req.OtherRules
    $content = $content -replace 'public function rules\(\): array\s*{\s*return \[\s*//\s*\];\s*}', "public function rules(): array
    {
        return [
            $rules
        ];
    }"
    Set-Content -Path $req.File -Value $content
}
