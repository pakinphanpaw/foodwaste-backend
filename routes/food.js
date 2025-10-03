const express = require("express");
const Food = require("../models/Food");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const foods = await Food.find().populate("user_id", "username role");

   
    const foodsWithImage = foods.map(food => {
      let foodObj = food.toObject();
      if (food.image && food.image.data) {
        foodObj.imageBase64 = food.image.data.toString("base64");
        foodObj.imageContentType = food.image.contentType;
      }
      return foodObj;
    });

    res.json(foodsWithImage);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.get("/my", authMiddleware, async (req, res) => {
  try {
    const foods = await Food.find({ user_id: req.user.user_id });

    const foodsWithImage = foods.map(food => {
      let foodObj = food.toObject();
      if (food.image && food.image.data) {
        foodObj.imageBase64 = food.image.data.toString("base64");
        foodObj.imageContentType = food.image.contentType;
      }
      return foodObj;
    });

    res.json(foodsWithImage);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.get("/available", async (req, res) => {
  try {
    const foods = await Food.find({ status: "available" })
      .populate("user_id", "username role");

    const foodsWithImage = foods.map(food => {
      let foodObj = food.toObject();
      if (food.image && food.image.data) {
        foodObj.imageBase64 = food.image.data.toString("base64");
        foodObj.imageContentType = food.image.contentType;
      }
      return foodObj;
    });

    res.json(foodsWithImage);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "seller" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only sellers or admins can add food" });
    }
    // รับข้อมูลจาก body ที่ส่งมา
    const {
      name,
      description,
      price,
      quantity,
      place_name,
      location,
      imageBase64,
      imageContentType,
    } = req.body;

    const foodData = {
      user_id: req.user.user_id,
      name,
      description,
      price,
      place_name,
      quantity,
    };

    // ตรวจสอบและเพิ่ม Location
    if (location && location.coordinates && location.coordinates.length === 2) {
      foodData.location = location;
    }

    // ตรวจสอบและเพิ่มรูปภาพ
    if (imageBase64) {
      foodData.image = {
        data: Buffer.from(imageBase64, "base64"),
        contentType: imageContentType || "image/jpeg",
      };
    }
    
    // สร้างและบันทึกข้อมูลอาหารใหม่
    const food = new Food(foodData);
    await food.save();

    res.status(201).json(food);
  } catch (err) {
    console.error("Error adding food:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });

    if (food.user_id.toString() !== req.user.user_id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(food, req.body);
    await food.save();
    res.json(food);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });

    if (food.user_id.toString() !== req.user.user_id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await food.deleteOne();
    res.json({ message: "Food deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
