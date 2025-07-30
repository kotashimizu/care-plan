declare module 'react-contenteditable' {
  import { Component, HTMLAttributes } from 'react';

  export interface ContentEditableEvent {
    target: {
      value: string;
    };
  }

  export interface Props extends HTMLAttributes<HTMLDivElement> {
    html: string;
    disabled?: boolean;
    onChange: (evt: ContentEditableEvent) => void;
    tagName?: string;
    innerRef?: (ref: HTMLElement | null) => void;
  }

  export default class ContentEditable extends Component<Props> {}
}