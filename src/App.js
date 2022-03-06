import React, { useState, useEffect } from 'react';
import Md from 'markdown-it';
import Segmented from './components/segmented';
import Editor from './components/editor';
import Preview from './components/preview';
import { channels } from './shared/constants';
import helpText from './components/helptext';

function App() {
  const md = new Md();
  const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const aIndex = tokens[idx].attrIndex('target');
    if (aIndex < 0) {
      tokens[idx].attrPush(['target', '_blank']);
    } else {
      tokens[idx].attrs[aIndex][1] = '_blank';
    }
    return defaultRender(tokens, idx, options, env, self);
  };

  const { ipcRenderer } = window.require('electron');
  const [filepath, setFilepath] = useState('');
  const [content, setContent] = useState('');
  const [draft, setDraft] = useState('');
  const [append, setAppend] = useState('');
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState(0);
  const [force, setForce] = useState(0);
  const [preview, setPreview] = useState(true);
  const [help, setHelp] = useState(true);
  const [togglePreview, setTogglePreview] = useState(0);
  const [toggleHelp, setToggleHelp] = useState(0);

  useEffect(() => {
    ipcRenderer.on(channels.OPEN_FILE, (e, { path, content }) => {
      setFilepath(path);
      setContent(content);
      setDraft(content);
      setDirty(false);
      setForce(Date.now());
    });

    ipcRenderer.on(channels.LOAD_IMAGE, () => {
      setLoading(true);
    });

    ipcRenderer.on(channels.EXTRACT_IMAGE, (e, { text }) => {
      setAppend(text);
      setLoading(false);
    });

    ipcRenderer.on(channels.NEW_FILE, () => {
      setFilepath('');
      setContent('');
      setDraft('');
      setAppend('');
      setDirty(false);
      setLoading(false);
      setForce(Date.now());
    });

    ipcRenderer.on(channels.SHOULD_SAVE, () => {
      setReply(1);
    });

    ipcRenderer.on(channels.SAVE_FILE, (e, data) => {
      if (data === 0) setReply(2);
      if (data === 1) setDirty(false);
    });

    ipcRenderer.on(channels.TOGGLE_PREVIEW, () => {
      setHelp(false);
      setTogglePreview(Date.now());
    });

    ipcRenderer.on(channels.TOGGLE_HELP, () => {
      setPreview(false);
      setToggleHelp(Date.now());
    });

  }, []);

  useEffect(() => {
    if (append) {
      setContent(draft + append);
      setDraft(draft + append);
      setDirty(true);
      setAppend('');
    }
  }, [append]);

  useEffect(() => {
    if (reply === 0) return;
    if (reply === 1) {
      ipcRenderer.send(channels.SHOULD_SAVE, dirty);
    }
    if (reply === 2) {
      ipcRenderer.send(channels.SAVE_FILE, {
        filepath,
        content: draft,
        html: md.render(draft),
      });
    }
    setReply(0);
  }, [reply]);

  useEffect(() => {
    setPreview(!preview);
  }, [togglePreview]);

  useEffect(() => { setHelp(!help); }, [toggleHelp]);

  function handleChange (value) {
    setDraft(value);
    setDirty(true);
  }

  function renderSecondPane () {
    if (!preview && !help) return <div />;
    if (preview) return <Preview content={md.render(draft)} />;
    if (help) return <Preview content={md.render(helpText)} />;
  }

  return (
    <div>
      { loading &&
        <div className='loading'>
          <div className='spinner' />
        </div>
      }
      <Segmented
        className="App"
        first={<Editor forceClear={force} content={content} onChange={handleChange} filepath={filepath} />}
        second={renderSecondPane()}
				ratio={(preview || help) ? 0.5 : 0.9}
      />
    </div>
  );
}

export default App;
