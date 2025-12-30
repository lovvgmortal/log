// import { Component, ErrorInfo, ReactNode } from 'react';

// interface ErrorBoundaryProps {
//     children: ReactNode;
// }

// interface ErrorBoundaryState {
//     hasError: boolean;
//     error: Error | null;
// }

// export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
//     state: ErrorBoundaryState = {
//             hasError: false,
//             error: null,
//         };

//     static getDerivedStateFromError(error: Error): ErrorBoundaryState {
//         return { hasError: true, error };
//     }

//     componentDidCatch(error: Error, errorInfo: ErrorInfo) {
//         console.error('Uncaught error:', error, errorInfo);
//     }

//     render() {
//         if (this.state.hasError) {
//             return (
//                 <div className="p-8 text-white bg-red-900/90 border border-red-500 rounded-lg m-8">
//                     <h2 className="text-xl font-bold mb-2 text-red-200">⚠️ DNA Lab Error</h2>
//                     <p className="mb-4 text-red-300">Có lỗi xảy ra trong DNA Lab:</p>
//                     <pre className="bg-black/40 p-4 rounded text-xs font-mono overflow-auto max-h-[400px] whitespace-pre-wrap text-red-100">
//                         {this.state.error?.toString()}
//                         {'\n\n'}
//                         {this.state.error?.stack}
//                     </pre>
//                 </div>
//             );
//         }

//         return this.props.children;
//     }
// }
