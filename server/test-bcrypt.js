const bcrypt = require('bcryptjs');

async function testBcrypt() {
  try {
    const password = 'testpassword';
    console.log('Password:', password);
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Hashed password:', hashedPassword);
    
    // Compare passwords
    const isMatch1 = await bcrypt.compare(password, hashedPassword);
    console.log('Password match with correct password:', isMatch1);
    
    const isMatch2 = await bcrypt.compare('wrongpassword', hashedPassword);
    console.log('Password match with wrong password:', isMatch2);
  } catch (error) {
    console.error('Error:', error);
  }
}

testBcrypt(); 