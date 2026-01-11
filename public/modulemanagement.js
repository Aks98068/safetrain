async function fetchModules() {
    try {
        const res = await fetch('/api/admin/modules');
        if (!res.ok) throw new Error("Failed to fetch modules");

        const data = await res.json();

        const tbody = document.getElementById('modulesTableBody');
        const cbody = document.getElementById('contentsTableBody');

        tbody.innerHTML = '';
        cbody.innerHTML = '';

        data.modules.forEach(module => {
            // Modules table
            tbody.innerHTML += `<tr>
                <td>${module.id}</td>
                <td>${module.title || ''}</td>
                <td>${module.type || ''}</td>
                <td>${module.description || ''}</td>
                <td>${module.image ? `<img src="${module.image}" style="max-width:100px;">` : ''}</td>
                <td>${module.video_url ? `<a href="${module.video_url}" target="_blank">Video</a>` : ''}</td>
                <td>
                    <button onclick="editModule(${module.id})">Edit</button>
                    <button onclick="deleteModule(${module.id})">Delete</button>
                </td>
            </tr>`;

            // Contents table
            if (module.content_type || module.content_text || module.media) {
                cbody.innerHTML += `<tr>
                    <td>${module.id}</td>
                    <td>${module.content_type || ''}</td>
                    <td>${module.content_text || ''}</td>
                    <td>${module.media ? `<a href="${module.media}" target="_blank">Media</a>` : ''}</td>
                </tr>`;
            }
        });
    } catch (error) {
        console.error(error);
        alert("Failed to fetch modules");
    }
}

// Add / Edit Module
document.getElementById('moduleForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('moduleId').value;
    const payload = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        type: document.getElementById('type').value,
        image: document.getElementById('image').value,
        video_url: document.getElementById('video_url').value,
        content_type: document.getElementById('contentType').value,
        content_text: document.getElementById('contentText').value,
        media: document.getElementById('media').value
    };

    const url = id ? `/api/admin/modules/${id}` : '/api/admin/modules';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert("Module saved successfully!");
        fetchModules();
        e.target.reset();
        document.getElementById('moduleId').value = '';
    } else {
        alert("Failed to save module");
    }
});

// Delete Module
async function deleteModule(id) {
    if (!confirm("Are you sure?")) return;

    const res = await fetch(`/api/admin/modules/${id}`, { method: 'DELETE' });
    if (res.ok) {
        alert("Module deleted successfully!");
        fetchModules();
    } else {
        alert("Failed to delete module");
    }
}

// Edit Module
async function editModule(id) {
    const res = await fetch('/api/admin/modules');
    const data = await res.json();
    const module = data.modules.find(m => m.id === id);
    if (!module) return;

    document.getElementById('moduleId').value = module.id;
    document.getElementById('title').value = module.title;
    document.getElementById('description').value = module.description;
    document.getElementById('type').value = module.type;
    document.getElementById('image').value = module.image || '';
    document.getElementById('video_url').value = module.video_url || '';
    document.getElementById('contentType').value = module.content_type || '';
    document.getElementById('contentText').value = module.content_text || '';
    document.getElementById('media').value = module.media || '';
}

// Initial load
fetchModules();
