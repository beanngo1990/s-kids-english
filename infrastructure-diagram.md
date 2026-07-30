# Infrastructure Diagram for SKidsEnglish App

```mermaid
graph TD
    A[Mobile App<br/>React Native] --> B[Firebase Authentication]
    A --> C[Firebase Firestore<br/>Database]
    A --> D[Firebase Functions<br/>Backend Services]
    A --> E[Firebase Storage<br/>Assets/Audio Files]
    A --> F[RevenueCat<br/>Monetization]
    
    D --> C
    D --> G[Third-party APIs]
    D --> F
    
    H[Admin Panel<br/>Web Interface] --> C
    H --> D
    
    I[Content Management<br/>Scripts/Tools] --> C
    I --> E
    
    J[Asset Pipeline<br/>Optimization Scripts] --> E
    
    style A fill:#4CAF50,stroke:#388E3C,color:white
    style B fill:#2196F3,stroke:#0D47A1,color:white
    style C fill:#2196F3,stroke:#0D47A1,color:white
    style D fill:#2196F3,stroke:#0D47A1,color:white
    style E fill:#2196F3,stroke:#0D47A1,color:white
    style F fill:#FF9800,stroke:#E65100,color:white
    style G fill:#9E9E9E,stroke:#212121,color:white
    style H fill:#4CAF50,stroke:#388E3C,color:white
    style I fill:#4CAF50,stroke:#388E3C,color:white
    style J fill:#4CAF50,stroke:#388E3C,color:white
    
    classDef mobile fill:#4CAF50,stroke:#388E3C,color:white;
    classDef firebase fill:#2196F3,stroke:#0D47A1,color:white;
    classDef thirdparty fill:#FF9800,stroke:#E65100,color:white;
    classDef tools fill:#9E9E9E,stroke:#212121,color:white;
    
    class A,mobile
    class B,C,D,E,F,firebase
    class G,thirdparty
    class H,I,J,tools
```

## Component Descriptions

1. **Mobile App (React Native)**: Main application frontend for iOS and Android
2. **Firebase Authentication**: Handles user authentication and identity management
3. **Firebase Firestore**: NoSQL database for storing user progress, content metadata, and app data
4. **Firebase Functions**: Serverless backend functions for business logic, data processing, and integrations
5. **Firebase Storage**: Cloud storage for app assets, audio files, and generated content
6. **RevenueCat**: Third-party service for subscription management and in-app purchases
7. **Third-party APIs**: External services for additional functionality
8. **Admin Panel**: Web interface for content management and analytics
9. **Content Management Tools**: Scripts and tools for content creation and management
10. **Asset Pipeline**: Automated tools for optimizing and processing app assets

## Data Flow

- User interacts with Mobile App
- App authenticates with Firebase Authentication
- App reads/writes data to Firestore
- Complex operations are handled by Firebase Functions
- Media assets are stored/retrieved from Firebase Storage
- Monetization features are managed through RevenueCat
- Admins manage content through the Admin Panel
- Content creators use management tools to update app content
- Asset pipeline optimizes media files for efficient delivery