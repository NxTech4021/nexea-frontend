import StarterKit from '@tiptap/starter-kit';
import { EditorProvider } from '@tiptap/react';

import { Card } from '@mui/material';

import MenuBar from './menu-bar';

const TextEditor = () => {
  //   const editor = useEditor({
  //     extensions: [StarterKit],
  //     content: '<p>Hello, Tiptap!</p>',
  //   });

  const extensions = [StarterKit];

  return (
    <Card sx={{ borderRadius: 1 }}>
      <EditorProvider slotBefore={<MenuBar />} extensions={extensions} content="<h1>Hello</h1>" />
    </Card>
  );
};

export default TextEditor;
