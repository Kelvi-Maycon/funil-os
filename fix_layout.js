const fs = require('fs');
const file = './src/pages/ProjectDetail.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Rename the main wrapper from div -> Tabs
content = content.replace(
  '<div className="flex flex-col h-full bg-background overflow-hidden animate-fade-in">',
  '<Tabs defaultValue="funnels" className="flex flex-col h-full bg-background overflow-hidden animate-fade-in">'
);

// 2. Remove the Action Buttons
content = content.replace(
  /            <div className="flex items-center gap-3">\s*<Button[\s\S]*?<\/div>\n          <\/div>/m,
  '          </div>'
);

// 3. Remove Title & Description
content = content.replace(
  /            <div className="space-y-2 max-w-2xl">[\s\S]*?<\/p>\s*<\/div>/m,
  ''
);

// 4. Move TabsList up to where Title/Desc used to be
const tabsListMatch = content.match(/            <TabsList className="bg-background gap-2 p-1\.5 rounded-full flex flex-wrap justify-start border border-border inline-flex h-auto">[\s\S]*?<\/TabsList>/);

if (tabsListMatch) {
  content = content.replace(
    /          <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">\s*(<div className="flex items-center gap-6 bg-background p-4 rounded-2xl border border-border">)/m,
    `          <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">\n${tabsListMatch[0]}\n\n            $1`
  );
  // Remove the old Tabs wrapper inner elements up to TabsContent
  content = content.replace(
    /      <Tabs defaultValue="funnels" className="flex-1 flex flex-col min-h-0">\s*<div className="px-6 md:px-8 py-4 bg-card border-b border-border shrink-0 z-0">\s*<div className="max-w-\[1600px\] mx-auto w-full">\s*<TabsList[\s\S]*?<\/TabsList>\s*<\/div>\s*<\/div>\n\n/m,
    ''
  );
}

// 5. Change the inner container that previously wrapped TabsContent
content = content.replace(
  /        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 bg-background relative flex flex-col">/m,
  '      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 bg-background relative flex flex-col min-h-0">'
);

// 6. Fix closing Tabs tag
content = content.replace(
  /        <\/div>\n      <\/Tabs>\n\n      <TaskDetailSheet/m,
  '        </div>\n      </div>\n\n      <TaskDetailSheet'
);

content = content.replace(
  /    <\/div>\n  \)\n}\n$/m,
  '    </Tabs>\n  )\n}\n'
);

fs.writeFileSync(file, content);
console.log("Replacement done!");
