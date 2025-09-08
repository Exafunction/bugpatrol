import { assigneeToString } from '../slack';

// Simple test: call assigneeToString with sean@cognition.ai and check it returns U095M0PRZPD
async function testSeanEmail() {
  const testAssignee = {
    id: 'test-sean',
    name: 'Sean Test', 
    email: 'sean@cognition.ai'
  };
  
  const result = await assigneeToString(testAssignee);
  
  if (result === '<@U095M0PRZPD>') {
    console.log('✅ Test passed: sean@cognition.ai returns U095M0PRZPD');
  } else {
    console.log('❌ Test failed: expected <@U095M0PRZPD>, got:', result);
  }
}

testSeanEmail();
