const express = require('express');
const app = express();
const PORT = process.env.PORT || 3003; // Cổng 3003 cho Darkbeard

app.use(express.json());

let totalExecute = 0;
let dbServers = new Map(); 

function getSeaName(placeId) {
    const id = String(placeId);
    if (id === "4442274612") return "Darkbeard Sea 2";
    return `Darkbeard (Place: ${id})`;
}

app.post('/update-db', (req, res) => {
    console.log("➡️ [Web] Nhận yêu cầu POST từ Roblox:", req.body);

    const { jobid, players, placeId } = req.body;
    
    if (!jobid) {
        console.log("❌ [Lỗi Web] Từ chối do thiếu JobId");
        return res.status(400).send("Thiếu JobId");
    }

    // 🔒 BỘ LỌC SEA 2 CHẶT CHẼ
    if (String(placeId) !== "4442274612") {
        console.log(`❌ [Lỗi Web] Từ chối Server vì không phải Sea 2 (Place ID nhận được: ${placeId})`);
        return res.status(403).send("Chỉ nhận dữ liệu từ Sea 2");
    }

    totalExecute++; 

    dbServers.set(jobid, {
        "placeId": Number(placeId) || 0,
        "jobId": jobid,
        "players": Number(players) || 1,
        "name": getSeaName(placeId),
        "updatedAt": Date.now()
    });

    console.log(`✅ [Web] Đã nạp thành công Server Darkbeard! JobId: ${jobid} | Sea: ${placeId}`);
    res.status(200).send("Cập nhật thành công Server!");
});

app.get('/api', (req, res) => {
    const dataArray = Array.from(dbServers.values());
    res.json(dataArray);
});

setInterval(() => {
    const now = Date.now();
    for (let [jobid, data] of dbServers.entries()) {
        if (now - data.updatedAt > 15 * 60 * 1000) { 
            console.log(`🧹 [Web] Hết thời gian, xóa Server cũ: ${jobid}`);
            dbServers.delete(jobid);
        }
    }
}, 60000); 

app.get('/', (req, res) => {
    const dataArray = Array.from(dbServers.values());
    
    const finalData = {
        "Total Execute": totalExecute,
        "by": "tranduykhanh",
        "sea_filter": "Only Sea 2",
        "total_db_servers": dataArray.length,
        "db_data": dataArray
    };

    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Darkbeard Tracker - Sea 2</title>
        <style>
            body { background-color: #121212; color: #e0e0e0; font-family: monospace; padding: 15px; margin: 0; }
            .controls { margin-bottom: 10px; font-size: 14px; user-select: none; }
            pre { background-color: #181818; padding: 10px; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; font-size: 13px; margin: 0; }
        </style>
    </head>
    <body>
        <div class="controls"><label><input type="checkbox" id="prettyPrint" checked onchange="renderJSON()"> Tạo bản in đẹp</label></div>
        <pre id="jsonContent"></pre>
        <script>
            const rawData = ${JSON.stringify(finalData)};
            function renderJSON() {
                const isPretty = document.getElementById('prettyPrint').checked;
                const container = document.getElementById('jsonContent');
                if (isPretty) { container.textContent = JSON.stringify(rawData, null, 2); } else { container.textContent = JSON.stringify(rawData); }
            }
            renderJSON();
            setTimeout(() => { location.reload(); }, 8000);
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🚀 Web Darkbeard đang chạy tại port ${PORT} (Chỉ Sea 2)`);
});

