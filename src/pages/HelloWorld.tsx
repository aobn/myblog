import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HelloWorld: React.FC = () => {
  return (
    <div className="container mx-auto py-10 flex flex-col items-center justify-center gap-8">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-center">Hello World</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-center text-muted-foreground">
            这是一个简单的Hello World页面
          </p>
          <Button>点击我</Button>
        </CardContent>
      </Card>
      
      {/* 组件已移除 */}
    </div>
  );
};

export default HelloWorld;