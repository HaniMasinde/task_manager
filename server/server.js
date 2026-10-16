
const app = require('./app')

require('dotenv').config()
const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
  console.log("daily task manager api running on http://localhost:"+ PORT)
})