const dbConnection = require("../config/db.js");
const Role = require("../models/role.js")
// module.exports.createRole = async (req, res) => {
 
//     try {
//         if (req.body.role && req.body.role  != '') {
//             const newRole = new Role(req.body)
//             await newRole.save();
//             res.send('Role created successfully');
//         } else {
//             res.status(400).send('Bad request');
//         }
//     } catch (error) {
//         res.status(500).send("Internal server error");
//     }

// }


module.exports.getAllclasses = async (req, res) => {
    try {
      const getCategory = `SELECT * FROM users`;
    
        const pool = await dbConnection();
        pool.query(getCategory, (err, result) => {
          if (err) {
              console.log(err);
          } else {
            console.log('Working');
            console.log(result);
            return res.status(200).json(result);
              
          }
          
        });
    
    } catch (error) {
      console.error("Error occurred:", error);
      return res.status(500).json({ error: { msg: "An jj unexpected error occurred" } });
    }
};
  

// const executeQuery = async () => {
//     try {
//         const pool = await dbConnection();
//         pool.query(`SELECT * FROM students`, (err, result) => {
//             if (err) {
//                 console.error(err);
//             } else {
//                 console.log(result);
//             }
//         });
//     } catch (error) {
//         console.error(error);
//     }
// }
// executeQuery();
