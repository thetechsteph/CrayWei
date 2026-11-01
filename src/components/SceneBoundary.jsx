import { Component } from 'react';

// If WebGL or the 3D chunk fails at runtime, fall back to the static poster instead of a blank hero.
export default class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err) { console.warn('3D scene failed, using static fallback:', err); this.props.onError?.(err); }
  render() { return this.state.failed ? null : this.props.children; }
}
