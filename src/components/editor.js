import 'codemirror/mode/markdown/markdown.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/pug/pug.js';
import 'codemirror/mode/htmlmixed/htmlmixed.js';
import 'codemirror/mode/yaml/yaml.js';

import React, { useRef, useState, useEffect } from 'react';
import CodeMirror from 'codemirror/lib/codemirror';
import OdiaFSM from 'odia-keyboard/es/fsm';

function initEditor (el, value, filetype) {
  const editor = CodeMirror(el, {
    value: value || '',
    mode: filetype,
    lineNumbers: true,
    lineWrapping: true,
  });
  const fsm = new OdiaFSM();

  editor.on('keypress', function (_, e) {
    if (e.altKey || e.ctrlKey) return;
    e.preventDefault();
    const keycode = e.keyCode;
    const char = String.fromCharCode(keycode);
    const [dist, str] = fsm.input(char);
    const { line, ch } = editor.getCursor();
    editor.replaceRange(str, { line, ch: ch+dist }, {line, ch});
  });

  editor.on('keyup', function (e) {
    if (editor.getValue().length === 0) fsm.reset();
  });

  function keydownHandler (e) {
    if (e.ctrlKey && e.keyCode === 9) fsm.toggleLang();
  }
  document.addEventListener('keydown', keydownHandler);

  return {
    editor,
    cleanup: () => document.removeEventListener('keydown', keydownHandler),
  };
}

function getFileType (name) {
  if (!(/\./.test(name))) return 'markdown';
  const parts = name.split('.');
  const ext = parts[parts.length - 1];
  return {
    md: 'markdown',
    markdown: 'markdown',
    js: 'javascript',
    json: 'javascript',
    pug: 'pug',
    jade: 'pug',
    html: 'htmlmixed',
    yml: 'yaml',
    yaml: 'yaml',
  }[ext] || 'markdown';
}

export default function Editor ({ content, onChange, forceClear, filepath }) {
  const editorWrapper = useRef();
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    if (editorWrapper.current) {
      const { editor, cleanup } = initEditor(editorWrapper.current, content, getFileType(filepath));
      setEditor(editor);
      editor.on('change', () => onChange(editor.getValue()));
      return cleanup;
    }
  }, [editorWrapper]);

  useEffect(() => {
    if (editor) {
      editor.setValue(content);
      editor.setOption('mode', getFileType(filepath));
    }
  }, [ content, filepath, forceClear ]);

  return (
    <div className='editor-wrapper' ref={editorWrapper} />
  );
}
