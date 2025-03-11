import React from 'react';
import { useCurrentEditor } from '@tiptap/react';

import { Stack, Button } from '@mui/material';

const MenuBar = () => {
  const editor = useCurrentEditor();

  if (!editor) return null;

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        // disabled={!editor.can().chain().focus().toggleBold().run()}
      >
        Bold
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        // disabled={!editor.can().chain().focus().toggleItalic().run()}
      >
        Italic
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        // disabled={!editor.can().chain().focus().toggleStrike().run()}
      >
        Strike
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleCode().run()}
        // disabled={!editor.can().chain().focus().toggleCode().run()}
      >
        Code
      </Button>
      <Button onClick={() => editor.chain().focus().unsetAllMarks().run()}>Clear marks</Button>
      <Button onClick={() => editor.chain().focus().clearNodes().run()}>Clear nodes</Button>
      <Button onClick={() => editor.chain().focus().setParagraph().run()}>Paragraph</Button>
    </Stack>
  );
};

export default MenuBar;
