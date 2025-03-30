# File System Operations and POST Requests with Node.js

This 2-hour lesson covers handling POST requests in Express.js and interacting with the file system using Node.js's built-in `fs` module. By the end, you'll be able to create a server that accepts data via POST requests and saves it to files.

## Learning Objectives

- Understand how to handle POST requests in Express.js
- Learn to use the Node.js `fs` module for file operations
- Create a simple API that persists data to the file system

## Prerequisites

- Basic understanding of JavaScript
- Familiarity with Node.js and npm
- Understanding of HTTP methods
- Basic knowledge of Express.js

## File System Operations in Node.js

Node.js provides a built-in module called `fs` (file system) that allows you to work with the file system on your computer.

### Basic File Operations

#### 1. Reading Files

```javascript
const fs = require("fs");

// Synchronous read
try {
  const data = fs.readFileSync("file.txt", "utf8");
  console.log(data);
} catch (err) {
  console.error("Error reading file:", err);
}

// Asynchronous read
fs.readFile("file.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }
  console.log(data);
});

// Using promises
const fsPromises = require("fs").promises;

async function readFileAsync() {
  try {
    const data = await fsPromises.readFile("file.txt", "utf8");
    console.log(data);
  } catch (err) {
    console.error("Error reading file:", err);
  }
}
```

#### 2. Writing to Files

```javascript
const fs = require("fs");

// Synchronous write
try {
  fs.writeFileSync("file.txt", "Hello, World!");
  console.log("File written successfully");
} catch (err) {
  console.error("Error writing to file:", err);
}

// Asynchronous write
fs.writeFile("file.txt", "Hello, World!", (err) => {
  if (err) {
    console.error("Error writing to file:", err);
    return;
  }
  console.log("File written successfully");
});

// Append to file
fs.appendFile("file.txt", "\nAppended content", (err) => {
  if (err) {
    console.error("Error appending to file:", err);
    return;
  }
  console.log("Content appended successfully");
});
```

#### 3. Creating Directories

```javascript
const fs = require("fs");

// Create directory
fs.mkdir("newDirectory", (err) => {
  if (err) {
    console.error("Error creating directory:", err);
    return;
  }
  console.log("Directory created successfully");
});

// Create nested directories
fs.mkdir("parent/child/grandchild", { recursive: true }, (err) => {
  if (err) {
    console.error("Error creating nested directories:", err);
    return;
  }
  console.log("Nested directories created successfully");
});
```

#### 4. Deleting Files and Directories

```javascript
const fs = require("fs");

// Delete file
fs.unlink("file.txt", (err) => {
  if (err) {
    console.error("Error deleting file:", err);
    return;
  }
  console.log("File deleted successfully");
});

// Delete directory
fs.rmdir("newDirectory", (err) => {
  if (err) {
    console.error("Error deleting directory:", err);
    return;
  }
  console.log("Directory deleted successfully");
});

// Delete directory with content (Node.js v16+)
fs.rm("parent", { recursive: true }, (err) => {
  if (err) {
    console.error("Error deleting directory recursively:", err);
    return;
  }
  console.log("Directory and contents deleted successfully");
});
```

#### 5. Checking if a File or Directory Exists

```javascript
const fs = require("fs");

// Check if file exists
fs.access("file.txt", fs.constants.F_OK, (err) => {
  if (err) {
    console.log("File does not exist");
    return;
  }
  console.log("File exists");
});

// Using existsSync (synchronous)
if (fs.existsSync("file.txt")) {
  console.log("File exists");
} else {
  console.log("File does not exist");
}
```

## Handling POST Requests in Express.js

### Setting Up an Express Server

```javascript
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

// Middleware for parsing JSON bodies
app.use(express.json());
// Middleware for parsing URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

### Creating a POST Endpoint

```javascript
// Save data to a file
app.post("/save-data", (req, res) => {
  const data = req.body;

  if (!data) {
    return res.status(400).json({ error: "No data provided" });
  }

  const filePath = path.join(__dirname, "data.json");

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Error writing to file:", err);
      return res.status(500).json({ error: "Failed to save data" });
    }

    res.status(200).json({ success: true, message: "Data saved successfully" });
  });
});
```

### Example: Creating a Simple Notes API

```javascript
// Create a directory for notes if it doesn't exist
const notesDir = path.join(__dirname, "notes");
if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir);
}

// Create a new note
app.post("/notes", (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const noteId = Date.now().toString();
  const noteFilePath = path.join(notesDir, `${noteId}.json`);

  const noteData = {
    id: noteId,
    title,
    content,
    createdAt: new Date().toISOString(),
  };

  fs.writeFile(noteFilePath, JSON.stringify(noteData, null, 2), (err) => {
    if (err) {
      console.error("Error creating note:", err);
      return res.status(500).json({ error: "Failed to create note" });
    }

    res.status(201).json({ success: true, note: noteData });
  });
});

// Get all notes
app.get("/notes", (req, res) => {
  fs.readdir(notesDir, (err, files) => {
    if (err) {
      console.error("Error reading notes directory:", err);
      return res.status(500).json({ error: "Failed to retrieve notes" });
    }

    const notes = [];
    let filesProcessed = 0;

    if (files.length === 0) {
      return res.status(200).json({ notes: [] });
    }

    files.forEach((file) => {
      fs.readFile(path.join(notesDir, file), "utf8", (err, data) => {
        filesProcessed++;

        if (!err) {
          try {
            const note = JSON.parse(data);
            notes.push(note);
          } catch (parseErr) {
            console.error("Error parsing note data:", parseErr);
          }
        }

        if (filesProcessed === files.length) {
          res.status(200).json({ notes });
        }
      });
    });
  });
});

// Delete a note
app.delete("/notes/:id", (req, res) => {
  const noteId = req.params.id;
  const noteFilePath = path.join(notesDir, `${noteId}.json`);

  fs.access(noteFilePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: "Note not found" });
    }

    fs.unlink(noteFilePath, (err) => {
      if (err) {
        console.error("Error deleting note:", err);
        return res.status(500).json({ error: "Failed to delete note" });
      }

      res
        .status(200)
        .json({ success: true, message: "Note deleted successfully" });
    });
  });
});
```

## Practical Exercise

1. Create an Express server with a POST endpoint
2. Accept JSON data and save it to a file
3. Create another endpoint to retrieve the saved data
4. Implement error handling for all operations

## Conclusion

In this lesson, you've learned how to:

- Use the `fs` module to perform file operations
- Handle POST requests in Express.js
- Create, read, update, and delete files using Node.js
- Build a simple API that persists data to the file system

These skills are fundamental for server-side development and building applications that need to store and manage data.
