const db = require('./config/db.js');
async function test() {
  try {
    const [courses] = await db.query('SELECT * FROM tbl_courses LIMIT 1');
    if(courses.length > 0) {
      const id = courses[0].id;
      console.log('Found course ID:', id);
      const courseSql = `
        SELECT c.*, 
               cl.class_name, 
               COALESCE(c.selected_subject, s.subject_name) AS subject_name, 
               m.name AS membership_name, m.price AS membership_price
        FROM tbl_courses c
        LEFT JOIN tbl_class cl ON c.class_id = cl.id
        LEFT JOIN tbl_subject s ON c.subject_id = s.id
        LEFT JOIN tbl_membership m ON c.membership_id = m.id
        WHERE c.id = $1
      `;
      const [res] = await db.query(courseSql, [id]);
      console.log('Result length:', res.length);
      console.log('Result 0:', res[0]);
    } else {
      console.log('No courses found');
    }
  } catch (e) {
    console.error(e);
  } finally {
    db.end();
  }
}
test();
