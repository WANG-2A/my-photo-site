// 响应结构调试工具
function debugResponse(data) {
    console.log('=== Coze API 响应结构调试 ===');
    console.log('1. 完整响应:', JSON.stringify(data, null, 2));
    console.log('2. data类型:', typeof data);
    console.log('3. data.data:', data.data);
    
    if (data.data) {
        console.log('4. data.data类型:', typeof data.data);
        console.log('5. data.data键:', Object.keys(data.data));
        
        // 检查各个可能的字段
        console.log('6. data.data.answer:', data.data.answer);
        console.log('7. data.data.status:', data.data.status);
        console.log('8. data.data.messages:', data.data.messages);
        
        if (data.data.messages) {
            console.log('9. messages类型:', typeof data.data.messages);
            console.log('10. messages长度:', data.data.messages.length);
            
            if (data.data.messages.length > 0) {
                const firstMessage = data.data.messages[0];
                console.log('11. 第一个消息:', firstMessage);
                console.log('12. 第一个消息键:', Object.keys(firstMessage));
                console.log('13. content:', firstMessage.content);
                console.log('14. content类型:', typeof firstMessage.content);
                
                if (firstMessage.content) {
                    console.log('15. content键:', Object.keys(firstMessage.content));
                    if (typeof firstMessage.content === 'object') {
                        console.log('16. content.text:', firstMessage.content.text);
                    }
                }
            }
        }
    }
    
    console.log('=== 调试结束 ===');
    return data;
}

// 添加到window以便在浏览器中使用
if (typeof window !== 'undefined') {
    window.debugResponse = debugResponse;
}