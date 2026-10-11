/* =====================================================
   Baca data dashboard admin (localStorage) -> tampil di website publik
   Dipakai: homepage.html (Informasi terbaru), informasi.html (jadwal + biaya)
   Kalau belum ada data, isi HTML statis dibiarkan apa adanya.
   ===================================================== */
(function () {
    const KEY = 'medichatAdmin_v3'; // harus sama dengan KEY di dashboard.html
    const KAT = [
        'Pemeriksaan & Konsultasi Rawat Jalan',
        'Visite & Konsultasi Rawat Inap',
        'Akomodasi Rawat Inap'
    ];

    const el = (tag, cls, txt) => {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (txt !== undefined) e.textContent = txt;
        return e;
    };

    const ambil = () => {
        try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
    };

    const tglID = (iso) => iso
        ? new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

    function tabel(heads, rows) {
        const wrap = el('div', 'table-wrap');
        const t = el('table');
        const thead = el('thead');
        const trh = el('tr');
        const tbody = el('tbody');
        heads.forEach((h) => trh.append(el('th', '', h)));
        thead.append(trh);
        rows.forEach((r) => {
            const tr = el('tr');
            r.forEach((v) => tr.append(el('td', '', v || '-')));
            tbody.append(tr);
        });
        t.append(thead, tbody);
        wrap.append(t);
        return wrap;
    }

    // buang tabel statis / hasil render sebelumnya, pasang yang baru sebelum <p class="note">
    function ganti(sec, nodes) {
        const note = sec.querySelector('.note');
        sec.querySelectorAll('.table-wrap, .dyn').forEach((n) => n.remove());
        nodes.forEach((n) => {
            n.classList.add('dyn');
            sec.insertBefore(n, note);
        });
    }

    function jadwal(d) {
        const sec = document.getElementById('jadwal');
        if (!sec || !d.jadwal || !d.jadwal.length) return;
        ganti(sec, [tabel(
            ['Layanan', 'Dokter', 'Ruangan', 'Hari', 'Jam'],
            d.jadwal.map((j) => [j.layanan, j.dokter, j.ruangan, j.hari, j.jam])
        )]);
    }

    function biaya(d) {
        const sec = document.getElementById('biaya');
        if (!sec || !d.biaya || !d.biaya.length) return;
        const nodes = [];
        KAT.forEach((k, i) => {
            const list = d.biaya.filter((b) => b.kategori === k);
            if (!list.length) return;
            nodes.push(el('h3', '', k));
            nodes.push(i === 1
                ? tabel(['Kelas Perawatan', 'dr. Spesialis', 'dr. Umum', 'Cito/Libur dr. Spesialis'],
                        list.map((b) => [b.nama, b.tarif, b.umum, b.cito]))
                : tabel([i === 0 ? 'Kategori Tindakan' : 'Kelas', 'Tarif'],
                        list.map((b) => [b.nama, b.tarif])));
        });
        ganti(sec, nodes);
    }

    function info(d) {
        const box = document.getElementById('data-info');
        if (!box) return;
        const max = parseInt(box.dataset.limit, 10) || 3;
        const list = (d.Informasi_Puskesmas || [])
            .slice()
            .sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''))
            .slice(0, max);
        box.replaceChildren();
        box.closest('section').hidden = !list.length;
        list.forEach((i) => {
            const card = el('article', 'card');
            const body = el('div', 'card-content');
            body.append(el('h3', '', i.judul), el('small', '', tglID(i.tanggal)), el('p', '', i.isi));
            card.append(body);
            box.append(card);
        });
    }

    function draw() {
        const d = ambil();
        if (!d) return;
        jadwal(d);
        biaya(d);
        info(d);
    }

    draw();
    // update langsung kalau admin mengubah data di tab lain
    window.addEventListener('storage', (e) => { if (e.key === KEY) draw(); });
})();