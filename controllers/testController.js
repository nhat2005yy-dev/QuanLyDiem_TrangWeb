const testController = {
    getTest: (req, res) => {
        res.status(200).send("API working");
    }
};

module.exports = testController;
