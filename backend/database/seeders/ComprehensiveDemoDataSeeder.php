<?php

namespace Database\Seeders;

use App\Enums\FileVersionApprovalStatus;
use App\Models\AdditionalLoad;
use App\Models\Approval;
use App\Models\Brief;
use App\Models\Client;
use App\Models\ContentPlan;
use App\Models\Contract;
use App\Models\File;
use App\Models\FileType;
use App\Models\OutputType;
use App\Models\Project;
use App\Models\ProjectFinancial;
use App\Models\ProjectOutput;
use App\Models\ProjectType;
use App\Models\Revision;
use App\Models\Script;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\TaskType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class ComprehensiveDemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Roles Exist
        $roles = [
            'System Administrator',
            'Creative Director',
            'Account Executive',
            'Social Media Specialist',
            'Graphic Designer',
            'Video Editor / DAV',
            'KOL',
            'Production Assistant',
        ];

        foreach ($roles as $r) {
            Role::firstOrCreate(['name' => $r, 'guard_name' => 'web']);
        }

        // 2. Ensure Master Users from step.md Exist
        $teamMembers = [
            ['name' => 'Kirana', 'email' => 'kirana@locotrack.com', 'role' => 'Creative Director'],
            ['name' => 'Vincent', 'email' => 'vincent@locotrack.com', 'role' => 'Account Executive'],
            ['name' => 'Febry', 'email' => 'febry@locotrack.com', 'role' => 'Account Executive'],
            ['name' => 'Fabian', 'email' => 'fabian@locotrack.com', 'role' => 'Account Executive'],
            ['name' => 'Deven', 'email' => 'deven@locotrack.com', 'role' => 'Graphic Designer'],
            ['name' => 'Farel', 'email' => 'farel@locotrack.com', 'role' => 'Graphic Designer'],
            ['name' => 'Lucky', 'email' => 'lucky@locotrack.com', 'role' => 'Graphic Designer'],
            ['name' => 'Thoyib', 'email' => 'thoyib@locotrack.com', 'role' => 'Graphic Designer'],
            ['name' => 'Bryan', 'email' => 'bryan@locotrack.com', 'role' => 'Video Editor / DAV'],
            ['name' => 'Vito', 'email' => 'vito@locotrack.com', 'role' => 'Video Editor / DAV'],
            ['name' => 'Rafli', 'email' => 'rafli@locotrack.com', 'role' => 'Video Editor / DAV'],
            ['name' => 'Wisnu', 'email' => 'wisnu@locotrack.com', 'role' => 'Social Media Specialist'],
            ['name' => 'Jessica', 'email' => 'jessica@locotrack.com', 'role' => 'KOL'],
            ['name' => 'Alfian', 'email' => 'alfian@locotrack.com', 'role' => 'Production Assistant'],
        ];

        $userMap = [];
        foreach (User::all() as $u) {
            $userMap[strtolower($u->name)] = $u;
        }

        foreach ($teamMembers as $tm) {
            $user = User::firstOrCreate(
                ['email' => $tm['email']],
                [
                    'name' => $tm['name'],
                    'username' => strtolower($tm['name']),
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
            $role = Role::findByName($tm['role'], 'web');
            $user->syncRoles([$role]);
            $userMap[strtolower($tm['name'])] = $user;
        }

        // 3. Ensure Master File Types & Task Types
        $fileTypes = ['Brief Document', 'Design Master / PSD', 'Raw Footage', 'Video Export', 'Client Contract', 'Monthly Report', 'BAST Signoff'];
        $fileTypeModels = [];
        foreach ($fileTypes as $ft) {
            $fileTypeModels[$ft] = FileType::firstOrCreate(['name' => $ft], ['code' => strtoupper(substr(str_replace(' ', '', $ft), 0, 4))]);
        }

        $taskTypes = ['Graphic Design', 'Video Editing', 'Scriptwriting', 'Content Planning', 'Motion Graphic', 'Shooting / Production', 'Review & QC'];
        $taskTypeModels = [];
        foreach ($taskTypes as $tt) {
            $taskTypeModels[$tt] = TaskType::firstOrCreate(['name' => $tt], ['code' => strtoupper(substr(str_replace(' ', '', $tt), 0, 4))]);
        }

        $outputTypes = OutputType::all();
        $singlePost = OutputType::firstOrCreate(['name' => 'Single Post'], ['category' => 'Social Media']);
        $carousel = OutputType::firstOrCreate(['name' => 'Carousel'], ['category' => 'Social Media']);
        $storyIg = OutputType::firstOrCreate(['name' => 'Story IG'], ['category' => 'Social Media']);
        $reels = OutputType::firstOrCreate(['name' => 'Reels'], ['category' => 'Video & Reels']);
        $videoIklan = OutputType::firstOrCreate(['name' => 'Video Iklan 1920x1080'], ['category' => 'Commercial']);

        // 4. Seed Outputs for Key Projects
        $projects = Project::take(20)->get();
        foreach ($projects as $prj) {
            ProjectOutput::firstOrCreate(
                ['project_id' => $prj->id, 'output_type_id' => $singlePost->id],
                ['target_qty' => 12, 'actual_qty' => rand(8, 12), 'period' => 'Periode 1']
            );
            ProjectOutput::firstOrCreate(
                ['project_id' => $prj->id, 'output_type_id' => $carousel->id],
                ['target_qty' => 8, 'actual_qty' => rand(4, 8), 'period' => 'Periode 1']
            );
            ProjectOutput::firstOrCreate(
                ['project_id' => $prj->id, 'output_type_id' => $reels->id],
                ['target_qty' => 6, 'actual_qty' => rand(2, 6), 'period' => 'Periode 1']
            );
            ProjectOutput::firstOrCreate(
                ['project_id' => $prj->id, 'output_type_id' => $storyIg->id],
                ['target_qty' => 20, 'actual_qty' => rand(15, 20), 'period' => 'Periode 1']
            );
        }

        // 5. Seed Tasks with Real Aligned Data
        $sampleTasksData = [
            [
                'project_name' => 'Culture Run',
                'title' => 'Daily Feed Content - Running Shoes Highlight',
                'task_type' => 'Graphic Design',
                'output_type' => $carousel->id,
                'priority' => 'HIGH',
                'status' => 'ON_PROGRESS',
                'due_date' => Carbon::today()->addDays(1)->format('Y-m-d'),
                'assignee' => 'Deven',
                'description' => 'Desain carousel 5 slide perbandingan sepatu lari seri marathon.',
            ],
            [
                'project_name' => 'Culture Run',
                'title' => 'Revisi Video Reels - Morning Run Aesthetic',
                'task_type' => 'Video Editing',
                'output_type' => $reels->id,
                'priority' => 'URGENT',
                'status' => 'REVISION',
                'due_date' => Carbon::today()->format('Y-m-d'),
                'assignee' => 'Bryan',
                'description' => 'Revisi hook detik 0-3 ganti beat audio dan koreksi color grading.',
            ],
            [
                'project_name' => 'Kolesom',
                'title' => 'Preview Content Plan Agustus Periode 2',
                'task_type' => 'Content Planning',
                'output_type' => $singlePost->id,
                'priority' => 'HIGH',
                'status' => 'PREVIEW_CD',
                'due_date' => Carbon::today()->format('Y-m-d'),
                'assignee' => 'Farel',
                'description' => 'Review materi copywriting dan jadwal tayang kampanye akhir pekan.',
            ],
            [
                'project_name' => 'CBP',
                'title' => 'Create Carousel Banner Promo Kemerdekaan',
                'task_type' => 'Graphic Design',
                'output_type' => $carousel->id,
                'priority' => 'HIGH',
                'status' => 'PREVIEW_CLIENT',
                'due_date' => Carbon::today()->addDays(2)->format('Y-m-d'),
                'assignee' => 'Thoyib',
                'description' => 'Desain visual merah putih dengan CTA diskon 45%.',
            ],
            [
                'project_name' => 'Sentosa',
                'title' => 'Video Iklan 1920x1080 - Commercial Shoot Edit',
                'task_type' => 'Video Editing',
                'output_type' => $videoIklan->id,
                'priority' => 'URGENT',
                'status' => 'ON_PROGRESS',
                'due_date' => Carbon::today()->addDays(3)->format('Y-m-d'),
                'assignee' => 'Vito',
                'description' => 'Editing TVC 30 detik untuk kanal YouTube dan Digital Ads.',
            ],
            [
                'project_name' => 'Kilin',
                'title' => 'Story IG Daily Engagement Quiz',
                'task_type' => 'Graphic Design',
                'output_type' => $storyIg->id,
                'priority' => 'MID',
                'status' => 'READY_TO_UPLOAD',
                'due_date' => Carbon::today()->format('Y-m-d'),
                'assignee' => 'Lucky',
                'description' => 'Template story interaktif dengan interactive sticker placeholder.',
            ],
            [
                'project_name' => 'Finega',
                'title' => 'Scriptwriting UGC Video 30 Sec Testimonial',
                'task_type' => 'Scriptwriting',
                'output_type' => $reels->id,
                'priority' => 'HIGH',
                'status' => 'ACC_CD',
                'due_date' => Carbon::today()->addDays(4)->format('Y-m-d'),
                'assignee' => 'Rafli',
                'description' => 'Naskah video UGC angle problem-solution untuk produk kecantikan.',
            ],
            [
                'project_name' => 'Impro',
                'title' => 'Single Post Promo End of Month',
                'task_type' => 'Graphic Design',
                'output_type' => $singlePost->id,
                'priority' => 'LOW',
                'status' => 'DONE',
                'due_date' => Carbon::yesterday()->format('Y-m-d'),
                'assignee' => 'Deven',
                'description' => 'Desain feed promo katalog produk.',
            ],
            [
                'project_name' => 'Manita',
                'title' => 'Video Reels Behind The Scenes Production',
                'task_type' => 'Video Editing',
                'output_type' => $reels->id,
                'priority' => 'MID',
                'status' => 'PUBLISH',
                'due_date' => Carbon::today()->format('Y-m-d'),
                'assignee' => 'Bagas',
                'description' => 'Editing reels BTS studio session.',
            ],
            [
                'project_name' => 'Mix Max',
                'title' => 'Overdue Content Plan Verification',
                'task_type' => 'Content Planning',
                'output_type' => $carousel->id,
                'priority' => 'HIGH',
                'status' => 'OVERDUE',
                'due_date' => Carbon::today()->subDays(3)->format('Y-m-d'),
                'assignee' => 'Farel',
                'description' => 'Penyelesaian brief & revisi tertunda sejak minggu lalu.',
            ],
        ];

        $taskIndex = 100;
        foreach ($sampleTasksData as $item) {
            $prj = Project::where('name', 'like', "%{$item['project_name']}%")->first() ?? $projects->first();
            $taskTypeModel = $taskTypeModels[$item['task_type']] ?? $taskTypeModels['Graphic Design'];
            $assigneeUser = $userMap[strtolower($item['assignee'])] ?? $userMap['deven'] ?? User::first();

            $task = Task::firstOrCreate(
                ['task_no' => "TSK-" . (++$taskIndex)],
                [
                    'project_id' => $prj->id,
                    'title' => $item['title'],
                    'task_type_id' => $taskTypeModel->id,
                    'output_type_id' => $item['output_type'],
                    'description' => $item['description'],
                    'due_date' => $item['due_date'],
                    'priority' => $item['priority'],
                    'status' => $item['status'],
                    'quantity' => 1,
                    'created_by' => $userMap['kirana']->id ?? 1,
                ]
            );

            TaskAssignment::firstOrCreate(
                ['task_id' => $task->id, 'user_id' => $assigneeUser->id],
                [
                    'assigned_by' => $userMap['kirana']->id ?? 1,
                    'assigned_at' => now(),
                    'deadline' => $item['due_date'],
                    'priority' => $item['priority'],
                    'extra_brief' => 'Follow brand voice guidelines in brief repository.',
                ]
            );
        }

        // 6. Seed Additional Loads
        AdditionalLoad::firstOrCreate(
            ['description' => 'Revisi Kilat Desain Flyer Dadakan Sentosa'],
            [
                'date' => Carbon::today()->format('Y-m-d'),
                'project_id' => $projects->first()->id,
                'ae_id' => $userMap['vincent']->id ?? 1,
                'assigned_user_id' => $userMap['deven']->id ?? 1,
                'task_type_id' => $taskTypeModels['Graphic Design']->id,
                'output_type_id' => $singlePost->id,
                'due_date' => Carbon::today()->addDays(1)->format('Y-m-d'),
                'priority' => 'URGENT',
                'status' => 'ON_PROGRESS',
                'notes' => 'Request ekstra dari PIC Klien via WhatsApp untuk pameran besok.',
            ]
        );

        AdditionalLoad::firstOrCreate(
            ['description' => 'Ekstra Render Video 4K Format TVC'],
            [
                'date' => Carbon::today()->format('Y-m-d'),
                'project_id' => $projects->last()->id,
                'ae_id' => $userMap['sera']->id ?? 1,
                'assigned_user_id' => $userMap['bryan']->id ?? 1,
                'task_type_id' => $taskTypeModels['Video Editing']->id,
                'output_type_id' => $videoIklan->id,
                'due_date' => Carbon::today()->addDays(2)->format('Y-m-d'),
                'priority' => 'HIGH',
                'status' => 'REQUEST',
                'notes' => 'Add-on scope di luar paket SMM reguler.',
            ]
        );

        // 7. Seed Briefs
        foreach ($projects->take(6) as $p) {
            Brief::firstOrCreate(
                ['project_id' => $p->id],
                [
                    'brief_text' => "Brand campaign brief for {$p->name}. Fokus pada peningkatan brand awareness dan konversi interaksi followers.",
                    'objective' => 'Increase Brand Awareness & Engagement by 25% MoM',
                    'platform' => 'Instagram & TikTok',
                    'content_requirement' => '12 Feeds (Single & Carousel), 6 Reels, 20 IG Stories per bulan.',
                    'reference' => 'https://instagram.com/benchmark_brand',
                    'deadline' => Carbon::today()->addDays(14)->format('Y-m-d'),
                    'created_by' => $userMap['isna']->id ?? 1,
                ]
            );
        }

        // 8. Seed Content Plans
        $samplePlans = [
            ['title' => 'Edukasi Sepatu Lari', 'pillar' => 'Educational', 'type' => 'Carousel', 'ideation' => '5 Kesalahan Umum Saat Memilih Sepatu Lari', 'caption' => 'Jangan sampai salah beli sepatu! Cek tips berikut agar lari kamu makin nyaman.'],
            ['title' => 'Flash Sale Promo', 'pillar' => 'Promotional', 'type' => 'Single Post', 'ideation' => 'Flash Sale Gajian Diskon Hingga 50%', 'caption' => 'Promo gajian hadir kembali! Buruan checkout sebelum kehabisan.'],
            ['title' => 'BTS Shoot', 'pillar' => 'Behind The Scenes', 'type' => 'Reels', 'ideation' => 'Studio Behind The Scenes Video Shoot', 'caption' => 'Intip keseruan tim di balik pembuatan video TVC terbaru kami!'],
            ['title' => 'Q&A Pelari', 'pillar' => 'Community / User Generated', 'type' => 'Story IG', 'ideation' => 'Q&A Temu Pelari & Polling Mingguan', 'caption' => 'Yuk share rute lari favorit kamu di kolom komentar!'],
        ];

        foreach ($projects->take(4) as $p) {
            foreach ($samplePlans as $idx => $sp) {
                ContentPlan::firstOrCreate(
                    ['project_id' => $p->id, 'ideation' => $sp['ideation']],
                    [
                        'title' => $sp['title'],
                        'content_pillar' => $sp['pillar'],
                        'content_type' => $sp['type'],
                        'output_type_id' => $singlePost->id,
                        'caption' => $sp['caption'],
                        'platform' => 'Instagram',
                        'posting_date' => Carbon::today()->addDays($idx * 3)->format('Y-m-d'),
                        'reference' => 'https://pinterest.com/pin/aesthetic_reference',
                        'notes' => 'Gunakan sound trending dan color palette brand.',
                        'created_by' => $userMap['amel']->id ?? 1,
                    ]
                );
            }
        }

        // 9. Seed Scripts & Ideations
        $sampleScripts = [
            [
                'title' => 'Video Edukasi: Cara Memilih Angle Foto Produk',
                'content_type' => 'Reels / TikTok',
                'hook' => 'Stop foto produk kamu kayak gini kalau mau omset naik!',
                'concept' => 'Side-by-side comparison cara salah vs cara benar.',
                'script_text' => "Detik 0-3: Hook visual produk jelek.\nDetik 3-10: Tunjukkan pencahayaan yang pas.\nDetik 10-25: 3 angle wajib (flat lay, eye level, 45 degree).\nDetik 25-30: CTA komen kata 'MAU' untuk dapat preset gratis.",
                'talent' => 'Jessica',
                'location' => 'Studio Loco Track 2',
                'cta' => 'Komen MAU untuk panduan lengkapnya!',
                'status' => 'APPROVED',
            ],
            [
                'title' => 'Behind The Scenes: Shoots Commercial Sentosa',
                'content_type' => 'Reels',
                'hook' => 'Kira-kira butuh berapa jam bikin video 15 detik ini?',
                'concept' => 'Fast-paced hyperlapse persiapan lighting & talent.',
                'script_text' => "Detik 0-5: Intro setting up studio.\nDetik 5-20: Keseruan pengambilan gambar talent.\nDetik 20-30: Hasil akhir TVC yang memukau.",
                'talent' => 'Team Loco',
                'location' => 'Outdoor Sentosa Garden',
                'cta' => 'Share ke temen kamu yang suka bikin video!',
                'status' => 'APPROVED',
            ],
        ];

        foreach ($projects->take(2) as $p) {
            foreach ($sampleScripts as $ss) {
                Script::firstOrCreate(
                    ['project_id' => $p->id, 'title' => $ss['title']],
                    array_merge($ss, ['created_by' => $userMap['naja']->id ?? 1])
                );
            }
        }

        // 10. Seed Files with Versions & Version History
        $sampleFiles = [
            ['name' => 'Reels_CultureRun_v1.mp4', 'type' => 'Video Export', 'ver' => 1],
            ['name' => 'Carousel_Promo_Sentosa_Final.psd', 'type' => 'Design Master / PSD', 'ver' => 2],
            ['name' => 'MOU_Kontrak_Kerjasama_2026.pdf', 'type' => 'Client Contract', 'ver' => 1],
            ['name' => 'Monthly_Report_July_2026.pdf', 'type' => 'Monthly Report', 'ver' => 1],
            ['name' => 'BAST_Signoff_CBP.pdf', 'type' => 'BAST Signoff', 'ver' => 1],
        ];

        foreach ($projects->take(3) as $p) {
            foreach ($sampleFiles as $sf) {
                $fileTypeModel = $fileTypeModels[$sf['type']] ?? $fileTypeModels['Design Master / PSD'];
                $f = File::firstOrCreate(
                    ['project_id' => $p->id, 'name' => $sf['name']],
                    [
                        'file_type_id' => $fileTypeModel->id,
                        'path' => "projects/{$p->id}/files/{$sf['name']}",
                        'uploaded_by' => $userMap['deven']->id ?? 1,
                    ]
                );

                $v = $f->versions()->firstOrCreate(
                    ['version_number' => $sf['ver']],
                    [
                        'path' => "projects/{$p->id}/files/{$sf['name']}",
                        'uploaded_by' => $userMap['deven']->id ?? 1,
                        'approval_status' => FileVersionApprovalStatus::APPROVED,
                    ]
                );

                $f->update(['current_version_id' => $v->id]);
            }
        }
    }
}
