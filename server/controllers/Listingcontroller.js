const Listing = require("../models/Listing");
const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
// Create Listing
exports.createListing = async (req, res) => {
  try {
    const listing = await Listing.create({
      title: req.body.title,
      category: req.body.category,
      brand: req.body.brand,
      size: req.body.size,
      condition: req.body.condition,
      description: req.body.description,
      estimatedValue: req.body.estimatedValue,
      location: req.body.location,
      image: req.file
  ? `uploads/clothing/${req.file.filename}`
  : "",
      owner: req.user.id,
    });

    const populatedListing = await Listing.findById(
      listing._id
    ).populate("owner", "name email location");

    res.status(201).json(populatedListing);
  } catch (error) {
    console.error("Create listing error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Listings with Search and Filters
exports.getListings = async (req, res) => {
  try {
    const {
      search,
      category,
      size,
      brand,
      condition,
      location,
      status,
      minValue,
      maxValue,
      sort,
    } = req.query;

    const filter = {};

    // Search in multiple listing fields
    if (search && search.trim() !== "") {
      const searchText = escapeRegex(search.trim());

      filter.$or = [
        {
          title: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          category: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          description: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          location: {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }

    // Category filter
    if (
      category &&
      category !== "All" &&
      category.trim() !== ""
    ) {
      filter.category = {
        $regex: `^${escapeRegex(category.trim())}$`,
        $options: "i",
      };
    }

    // Size filter
    if (
      size &&
      size !== "All" &&
      size.trim() !== ""
    ) {
      filter.size = {
        $regex: `^${escapeRegex(size.trim())}$`,
        $options: "i",
      };
    }

    // Brand filter
    if (
      brand &&
      brand !== "All" &&
      brand.trim() !== ""
    ) {
      filter.brand = {
        $regex: escapeRegex(brand.trim()),
        $options: "i",
      };
    }

    // Condition filter
    if (
      condition &&
      condition !== "All" &&
      condition.trim() !== ""
    ) {
      filter.condition = {
        $regex: `^${escapeRegex(condition.trim())}$`,
        $options: "i",
      };
    }

    // Location filter
    if (
      location &&
      location !== "All" &&
      location.trim() !== ""
    ) {
      filter.location = {
        $regex: escapeRegex(location.trim()),
        $options: "i",
      };
    }

    // Status filter
    if (
      status &&
      status !== "All" &&
      status.trim() !== ""
    ) {
      filter.status = {
        $regex: `^${escapeRegex(status.trim())}$`,
        $options: "i",
      };
    }

    // Estimated value filter
    if (minValue || maxValue) {
      filter.estimatedValue = {};

      if (
        minValue !== undefined &&
        minValue !== "" &&
        !Number.isNaN(Number(minValue))
      ) {
        filter.estimatedValue.$gte =
          Number(minValue);
      }

      if (
        maxValue !== undefined &&
        maxValue !== "" &&
        !Number.isNaN(Number(maxValue))
      ) {
        filter.estimatedValue.$lte =
          Number(maxValue);
      }

      if (
        Object.keys(filter.estimatedValue)
          .length === 0
      ) {
        delete filter.estimatedValue;
      }
    }

    // Sorting
    let sortOptions = {
      createdAt: -1,
    };

    if (sort === "oldest") {
      sortOptions = {
        createdAt: 1,
      };
    }

    if (sort === "value-low-high") {
      sortOptions = {
        estimatedValue: 1,
      };
    }

    if (sort === "value-high-low") {
      sortOptions = {
        estimatedValue: -1,
      };
    }

    if (sort === "title-a-z") {
      sortOptions = {
        title: 1,
      };
    }

    if (sort === "title-z-a") {
      sortOptions = {
        title: -1,
      };
    }

    const listings = await Listing.find(filter)
      .populate("owner", "name email location")
      .sort(sortOptions);

    res.status(200).json(listings);
  } catch (error) {
    console.error("Get listings error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Logged-in User Listings
exports.getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({
      owner: req.user.id,
    })
      .populate("owner", "name email location")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(listings);
  } catch (error) {
    console.error(
      "Get my listings error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single Listing
exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(
      req.params.id
    ).populate("owner", "name email location");

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.status(200).json(listing);
  } catch (error) {
    console.error("Get listing error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid listing ID",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Listing
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(
      req.params.id
    );

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    if (
      String(listing.owner) !==
      String(req.user.id)
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to update this listing",
      });
    }

    if (
      req.body.title !== undefined &&
      req.body.title.trim() !== ""
    ) {
      listing.title = req.body.title.trim();
    }

    if (
      req.body.category !== undefined &&
      req.body.category.trim() !== ""
    ) {
      listing.category =
        req.body.category.trim();
    }

    if (
      req.body.brand !== undefined &&
      req.body.brand.trim() !== ""
    ) {
      listing.brand = req.body.brand.trim();
    }

    if (
      req.body.size !== undefined &&
      req.body.size.trim() !== ""
    ) {
      listing.size = req.body.size.trim();
    }

    if (
      req.body.condition !== undefined &&
      req.body.condition.trim() !== ""
    ) {
      listing.condition =
        req.body.condition.trim();
    }

    if (
      req.body.description !== undefined &&
      req.body.description.trim() !== ""
    ) {
      listing.description =
        req.body.description.trim();
    }

    if (
      req.body.estimatedValue !== undefined &&
      req.body.estimatedValue !== ""
    ) {
      const estimatedValue = Number(
        req.body.estimatedValue
      );

      if (
        Number.isNaN(estimatedValue) ||
        estimatedValue < 0
      ) {
        return res.status(400).json({
          message:
            "Estimated value must be a valid positive number",
        });
      }

      listing.estimatedValue =
        estimatedValue;
    }

    if (
      req.body.location !== undefined &&
      req.body.location.trim() !== ""
    ) {
      listing.location =
        req.body.location.trim();
    }

    if (
      req.body.status !== undefined &&
      req.body.status.trim() !== ""
    ) {
      listing.status = req.body.status.trim();
    }

    if (req.file) {
  listing.image = `uploads/clothing/${req.file.filename}`;
}

    const updatedListing =
      await listing.save();

    const populatedListing =
      await Listing.findById(
        updatedListing._id
      ).populate(
        "owner",
        "name email location"
      );

    res.status(200).json(populatedListing);
  } catch (error) {
    console.error("Update listing error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid listing ID",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Listing
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(
      req.params.id
    );

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    if (
      String(listing.owner) !==
      String(req.user.id)
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to delete this listing",
      });
    }

    await listing.deleteOne();

    res.status(200).json({
      message:
        "Listing deleted successfully",
    });
  } catch (error) {
    console.error("Delete listing error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid listing ID",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};