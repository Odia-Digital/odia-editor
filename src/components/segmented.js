import React, { Component } from 'react';
import cn from 'classd';

export default class Segmented extends Component {
  static displayName = 'Segmented';
  static dividerWidth = 1;
  static snapDistance = 200;

  static defaultProps = {
    direction: 'horizontal',
    ratio: 0.5,
    maxRatio: 1,
  }

  constructor (props) {
    super(props);
    const maxRatio = props.maxRatio || 0.5;
    this.state = {
      dividerPosition: Math.min(props.ratio, maxRatio),
      lock: false,
      containerDim: null,
      firstDim: null,
      secondDim: null,
      firstOpen: true,
      secondOpen: true,
    };
  }

  static getDerivedStateFromProps (props, state) {
    const maxRatio = props.maxRatio || 1;
    const { containerDim } = state;
    const __dividerPosition = props.ratio || state.dividerPosition;
    const dividerPosition = Math.min (maxRatio, __dividerPosition)

    const updater = props.updateOn;

    return {
      ...state,
      dividerPosition,
      updater
    };
  }

  recalculate = _ => {
    if (!this.container) return;

    const containerDim = this.props.direction == 'vertical' ? this.container.offsetHeight : this.container.offsetWidth;
    const minDim = Math.max (containerDim / 20, Segmented.snapDistance);

    const firstDim = Math.max(minDim, containerDim * this.state.dividerPosition - Segmented.dividerWidth / 2);
    const secondDim = Math.max(minDim, containerDim * (1 - this.state.dividerPosition) - Segmented.dividerWidth / 2);

    const firstOpen = firstDim > minDim;
    const secondOpen = secondDim > minDim;

    this.setState({
      containerDim,
      firstDim,
      secondDim,
      firstOpen,
      secondOpen
    });
  }

  componentDidMount = _ => {
    window.setTimeout (_ => this.recalculate(), 0);
  }

  onDragEnd = event => {
    const {
      direction
    } = this.props;
    const maxRatio = this.props.maxRatio || 1;
    const pos = direction === 'vertical' ? event.clientY : event.clientX;
    const boundingRect = this.container.getBoundingClientRect()
    const begin = direction === 'vertical' ? boundingRect.top : boundingRect.left;

    const minDim = Math.max (this.state.containerDim / 20, Segmented.snapDistance);

    const __firstDim = Math.max (minDim, pos - begin);
    const dividerPosition = Math.min (maxRatio, __firstDim / this.state.containerDim);

    const firstDim = this.state.containerDim * dividerPosition;
    const secondDim = this.state.containerDim - firstDim - Segmented.dividerWidth;

    const firstOpen = firstDim > minDim;
    const secondOpen = secondDim > minDim;

    const prevState = this.state;

    this.setState(state => ({
      ...state,
      dividerPosition,
      firstDim,
      secondDim,
      firstOpen,
      secondOpen,
      lock: false
    }), this.handleExpandAndClose(prevState) );
  }

  handleExpandAndClose = prev => _ => {
    if (prev.firstOpen && !this.state.firstOpen && this.props.onFirstClose) this.props.onFirstClose();
    if (!prev.firstOpen && this.state.firstOpen && this.props.onFirstExpand) this.props.onFirstExpand();
    if (prev.secondOpen && !this.state.secondOpen && this.props.onSecondClose) this.props.onSecondClose();
    if (!prev.secondOpen && this.state.secondOpen && this.props.onSecondExpand) this.props.onSecondExpand();
  }

  onDragStart = event => {
    this.setState({
      lock: true
    });
  }

  containerRef = el => this.container = el;//React.createRef();
  firstContainerRef = el => this.firstContainer = el;//React.createRef();
  secondContainerRef = el => this.secondContainer = el;//React.createRef();

  render = _ => {
    const {
      direction
    } = this.props;

    const {
      dividerPosition,
      lock,
      firstDim,
      secondDim,
    } = this.state;

    return (
      <div
        className={cn`${direction === 'vertical' ? "segmented-vert" : "segmented-horz"} ${this.props.className}`}
        ref={this.containerRef}
      >
        <div
          className={cn`segmented-segment ${this.props.firstClassName}`}
          style={{
            [direction === 'vertical' ? 'height' : 'width']: firstDim
          }}
          ref={this.firstContainerRef}
        >
          {this.props.first}
        </div>
        <div
          className="segmented-divider"
          draggable={true}
          onDrag={this.onDrag}
          onDragStart={this.onDragStart}
          onDragEnd={this.onDragEnd}
        />
        <div
          className={cn`segmented-segment ${this.props.secondClassName}`}
          style={{
            [direction === 'vertical' ? 'height' : 'width']: secondDim
          }}
          ref={this.secondContainerRef}
        >
          {this.props.second}
        </div>
        <span style={{display: 'none'}}>{this.state.updater}</span>
      </div>
    );
  }
}
