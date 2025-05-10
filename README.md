## 🛡️ IP & Device Tracker API

This API stores and checks the IP address and device information of users using MongoDB. It can prevent duplicate entries and allows for deletion based on shared values via query parameters.

## 🚀 Features

- 📥 Saves IP and device info with timestamps.
- ❌ Prevents duplicate submissions.
- 🧹 Allows deletion of entries via query.
- 📡 Uses MongoDB for scalable and fast storage.

## 📦 Requirements

- Node.js 14+
- MongoDB URI in `.env` file as `MONGO_URI`
- Optional: `dotenv` package for local environment support

## 📡 Usage

**1. Endpoint**  
`GET /api/track`

**2. Query Parameters**

| Parameter      | Required | Description                                                                 |
|----------------|----------|-----------------------------------------------------------------------------|
| `delete`       | ❌       | Set to `true` to delete a saved record.                                     |
| `ip`           | ✅ (if `delete=true`) | IP address to match for deletion.                                |
| `device`       | ✅ (if `delete=true`) | URL-encoded device string to match for deletion.                |

**✅ Example Request (Insert)**
```bash
curl "http://localhost:3000/api/track"
```

**✅ Example Request (Delete)**
```bash
curl "http://localhost:3000/api/track?delete=true&ip=192.168.1.10&device=Mozilla%2F5.0"
```

**✅ Example Response (Saved)**
```json
{
  "status": "saved",
  "ip": "192.168.1.10",
  "device": "Mozilla/5.0"
}
```

**❌ Example Response (Already Used)**
```json
{
  "error": "Already used",
  "ip": "192.168.1.10",
  "device": "Mozilla/5.0"
}
```

**🧹 Example Response (Deleted)**
```json
{
  "status": "deleted",
  "deletedCount": 1,
  "stillExists": false,
  "ip": "192.168.1.10",
  "device": "Mozilla/5.0"
}
```

## 🔍 Code Explanation

- Uses `x-forwarded-for` or `remoteAddress` to fetch IP.
- `user-agent` is used to extract and log device.
- If already logged, it blocks the request.
- If `delete=true` is passed, the system attempts to remove the matching document.

## ⚠️ Error Handling

- 🛑 `400 Bad Request`: Missing `ip` or `device` on delete.
- 🧱 `403 Forbidden`: Repeated IP-device combo.
- 💥 `500 Internal Server Error`: MongoDB or server errors.

## 🛠️ Setup

1. Install dependencies:
```bash
npm install mongodb dotenv
```

2. Add a `.env` file in the root:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
```

3. Run your Node.js environment with the endpoint script.

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](https://github.com/NotFlexCoder/deviceid-ip-api/blob/main/LICENSE) file for details.
