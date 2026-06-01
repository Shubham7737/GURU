require('dotenv').config();
const db = require('./config/db.js');
const courseController = require('./controller/admin/course.controller.js');

async function test() {
  try {
    const resList = {
      status: function(s) { this.statusCode = s; return this; },
      json: async function(data) { 
        if(!data.success) return console.log('getAllData failed:', data.message);
        if(data.data.length === 0) return console.log('getAllData returned 0 courses');
        
        const firstCourse = data.data[0];
        console.log('First course ID from getAllData:', firstCourse.id);
        
        const reqSingle = { params: { id: firstCourse.id.toString() } };
        const resSingle = {
          status: function(s) { this.statusCode = s; return this; },
          json: function(data2) {
             console.log('getSingleData success:', data2.success);
             if(!data2.success) console.log('Error:', data2.message);
          }
        };
        await courseController.getSingleData(reqSingle, resSingle);
      }
    };
    await courseController.getAllData({}, resList);
  } catch(e) { console.error('Error:', e); }
  setTimeout(() => db.end(), 1000);
}
test();
