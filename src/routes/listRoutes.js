const express = require("express");
const { Client } = require("@microsoft/microsoft-graph-client");
const router = express.Router();
const List = require("../models/List"); // Assuming you'll create this model file
const jwt = require("jsonwebtoken");

// Middleware to check if user is authenticated with Microsoft
const isMicrosoftAuthenticated = (req, res, next) => {
  console.log("req.cookies", req.cookies);
  const token = req.cookies.auth_token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authenticated with Microsoft" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Local MongoDB list operations
router.get("/lists", isMicrosoftAuthenticated, async (req, res) => {
  try {
    const lists = await List.find({ userId: req.user.userId });
    res.json(lists);
  } catch (err) {
    console.error("Error fetching lists:", err);
    res.status(500).json({ message: "Error fetching lists from database" });
  }
});

router.post("/lists", isMicrosoftAuthenticated, async (req, res) => {
  if (
    !req.body.name ||
    typeof req.body.name !== "string" ||
    req.body.name.trim() === ""
  ) {
    return res.status(400).json({
      message: "List name is required and must be a non-empty string",
    });
  }

  const list = new List({
    name: req.body.name.trim(),
    items: [],
    userId: req.user.userId,
  });

  try {
    const newList = await list.save();
    res.status(201).json(newList);
  } catch (err) {
    console.error("Error saving list:", err);
    res.status(500).json({ message: "Error saving list to database" });
  }
});

router.put("/lists/:id", isMicrosoftAuthenticated, async (req, res) => {
  if (
    !req.body.name ||
    typeof req.body.name !== "string" ||
    req.body.name.trim() === ""
  ) {
    return res.status(400).json({
      message: "List name is required and must be a non-empty string",
    });
  }

  try {
    const list = await List.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name: req.body.name.trim() },
      { new: true }
    );
    if (!list) return res.status(404).json({ message: "List not found" });
    res.json(list);
  } catch (err) {
    console.error("Error updating list:", err);
    res.status(500).json({ message: "Error updating list in database" });
  }
});

router.delete("/lists/:id", isMicrosoftAuthenticated, async (req, res) => {
  try {
    const list = await List.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!list) return res.status(404).json({ message: "List not found" });
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting list:", err);
    res.status(500).json({ message: "Error deleting list from database" });
  }
});

router.post("/lists/:id/items", isMicrosoftAuthenticated, async (req, res) => {
  if (
    !req.body.name ||
    typeof req.body.name !== "string" ||
    req.body.name.trim() === ""
  ) {
    return res.status(400).json({
      message: "Item name is required and must be a non-empty string",
    });
  }

  try {
    const list = await List.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!list) return res.status(404).json({ message: "List not found" });

    const newItem = { name: req.body.name.trim() };
    list.items.push(newItem);
    await list.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error adding item to list:", err);
    res.status(500).json({ message: "Error adding item to list in database" });
  }
});

router.delete(
  "/lists/:listId/items/:itemId",
  isMicrosoftAuthenticated,
  async (req, res) => {
    try {
      const list = await List.findOne({
        _id: req.params.listId,
        userId: req.user.userId,
      });
      if (!list) return res.status(404).json({ message: "List not found" });

      // Find the index of the item to remove
      const itemIndex = list.items.findIndex(
        (item) => item._id.toString() === req.params.itemId
      );
      if (itemIndex === -1)
        return res.status(404).json({ message: "Item not found" });

      // Remove the item using splice
      list.items.splice(itemIndex, 1);

      // Save the updated list
      await list.save();
      res.status(204).send();
    } catch (err) {
      console.error("Error removing item from list:", err);
      res
        .status(500)
        .json({ message: "Error removing item from list in database" });
    }
  }
);

// Microsoft To Do operations
router.get("/todo/lists", isMicrosoftAuthenticated, async (req, res) => {
  try {
    const client = Client.init({
      authProvider: (done) => {
        done(null, req.user.accessToken);
      },
    });

    const result = await client.api("/me/todo/lists").get();

    res.json(result.value);
  } catch (error) {
    console.error("Error fetching To Do lists:", error);
    res.status(500).json({ message: "Error fetching To Do lists" });
  }
});

router.post(
  "/todo/lists/:listId/tasks",
  isMicrosoftAuthenticated,
  async (req, res) => {
    const { listId } = req.params;
    const { items } = req.body;

    try {
      const client = Client.init({
        authProvider: (done) => {
          done(null, req.user.accessToken);
        },
      });

      const addedTasks = [];

      for (const item of items) {
        const newTask = await client
          .api(`/me/todo/lists/${listId}/tasks`)
          .post({
            title: item.name,
          });
        addedTasks.push(newTask);
      }

      res.json(addedTasks);
    } catch (error) {
      console.error("Error adding tasks to To Do list:", error);
      res.status(500).json({ message: "Error adding tasks to To Do list" });
    }
  }
);

module.exports = router;
