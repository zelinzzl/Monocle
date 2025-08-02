import pandas as pd
import numpy as np
from prophet import Prophet
import pickle
import json
import os
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RiskProphetModel:
    def __init__(self, model_type='weather_risk'):
        self.model_type = model_type
        self.model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            changepoint_prior_scale=0.1,
            seasonality_prior_scale=10
        )
        self.is_fitted = False
        # Updated path to match your structure
        self.model_path = f'ml/savedModels/{model_type}_prophet.pkl'
        
    def prepare_weather_data(self, weather_data):
        """Convert weather data to Prophet format"""
        df = pd.DataFrame(weather_data)
        
        # Ensure we have the required columns
        if 'date' not in df.columns or 'risk_score' not in df.columns:
            # Generate synthetic South African weather risk data for training
            df = self._generate_sa_weather_data()
        
        df['ds'] = pd.to_datetime(df['date'])
        df['y'] = df['risk_score']
        
        return df[['ds', 'y']]
    
    def _generate_sa_weather_data(self, days=365*3):
        """Generate synthetic South African weather risk data"""
        start_date = datetime.now() - timedelta(days=days)
        dates = [start_date + timedelta(days=i) for i in range(days)]
        
        risk_scores = []
        for date in dates:
            # South African seasonal patterns
            month = date.month
            base_risk = 30
            
            # Summer (Dec-Feb) - Higher risk due to thunderstorms, hail
            if month in [12, 1, 2]:
                seasonal_risk = 25 + np.random.normal(0, 8)
            # Autumn (Mar-May) - Moderate risk
            elif month in [3, 4, 5]:
                seasonal_risk = 15 + np.random.normal(0, 5)
            # Winter (Jun-Aug) - Lower risk but possible heavy rain
            elif month in [6, 7, 8]:
                seasonal_risk = 10 + np.random.normal(0, 4)
            # Spring (Sep-Nov) - Increasing risk towards summer
            else:
                seasonal_risk = 20 + np.random.normal(0, 6)
            
            # Weekend patterns (higher travel risk)
            if date.weekday() >= 5:  # Saturday = 5, Sunday = 6
                weekend_risk = 5
            else:
                weekend_risk = 0
            
            total_risk = max(0, min(100, base_risk + seasonal_risk + weekend_risk))
            risk_scores.append(total_risk)
        
        return pd.DataFrame({
            'date': dates,
            'risk_score': risk_scores
        })
    
    def train(self, data=None):
        """Train the Prophet model"""
        try:
            if data is None:
                data = self._generate_sa_weather_data()
            
            training_data = self.prepare_weather_data(data)
            
            # Add South African holiday effects
            holidays = self._get_sa_holidays()
            if not holidays.empty:
                self.model.add_country_holidays(country_name='SA')
            
            self.model.fit(training_data)
            self.is_fitted = True
            
            # Save the model
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            with open(self.model_path, 'wb') as f:
                pickle.dump(self.model, f)
            
            logger.info(f"Prophet model trained and saved: {self.model_type}")
            return True
            
        except Exception as e:
            logger.error(f"Error training Prophet model: {e}")
            return False
    
    def predict(self, days_ahead=7):
        """Make predictions for upcoming days"""
        try:
            if not self.is_fitted:
                self.load_model()
            
            # Create future dataframe
            future = self.model.make_future_dataframe(periods=days_ahead)
            forecast = self.model.predict(future)
            
            # Get only future predictions
            future_forecast = forecast.tail(days_ahead)[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
            
            predictions = []
            for _, row in future_forecast.iterrows():
                predictions.append({
                    'date': row['ds'].strftime('%Y-%m-%d'),
                    'predicted_risk': max(0, min(100, row['yhat'])),
                    'risk_lower': max(0, min(100, row['yhat_lower'])),
                    'risk_upper': max(0, min(100, row['yhat_upper'])),
                    'confidence_interval': row['yhat_upper'] - row['yhat_lower']
                })
            
            return predictions
            
        except Exception as e:
            logger.error(f"Error making predictions: {e}")
            return []
    
    def predict_route_risk(self, route_coordinates, weather_data):
        """Predict risk for a specific route"""
        try:
            base_predictions = self.predict(days_ahead=1)
            if not base_predictions:
                return {'risk_score': 50, 'risk_level': 'Medium'}
            
            base_risk = base_predictions[0]['predicted_risk']
            
            # Adjust based on current weather
            weather_adjustment = self._calculate_weather_adjustment(weather_data)
            
            # Adjust based on route characteristics
            route_adjustment = self._calculate_route_adjustment(route_coordinates)
            
            final_risk = max(0, min(100, base_risk + weather_adjustment + route_adjustment))
            
            return {
                'risk_score': round(final_risk, 2),
                'risk_level': self._get_risk_level(final_risk),
                'weather_factor': weather_adjustment,
                'route_factor': route_adjustment,
                'prediction_confidence': base_predictions[0]['confidence_interval']
            }
            
        except Exception as e:
            logger.error(f"Error predicting route risk: {e}")
            return {'risk_score': 50, 'risk_level': 'Medium'}
    
    def _calculate_weather_adjustment(self, weather_data):
        """Calculate risk adjustment based on current weather"""
        if not weather_data:
            return 0
        
        adjustment = 0
        
        # Wind speed (km/h)
        wind_speed = weather_data.get('wind_speed', 0)
        if wind_speed > 60:
            adjustment += 25
        elif wind_speed > 40:
            adjustment += 15
        elif wind_speed > 25:
            adjustment += 8
        
        # Precipitation
        precipitation = weather_data.get('precipitation', 0)
        if precipitation > 20:  # Heavy rain
            adjustment += 30
        elif precipitation > 10:  # Moderate rain
            adjustment += 15
        elif precipitation > 2:  # Light rain
            adjustment += 5
        
        # Visibility (km)
        visibility = weather_data.get('visibility', 10)
        if visibility < 1:
            adjustment += 35
        elif visibility < 3:
            adjustment += 20
        elif visibility < 5:
            adjustment += 10
        
        # Temperature extremes
        temp = weather_data.get('temperature', 20)
        if temp > 35 or temp < 5:
            adjustment += 10
        
        return min(50, adjustment)  # Cap at 50 points
    
    def _calculate_route_adjustment(self, route_coordinates):
        """Calculate risk adjustment based on route characteristics"""
        if not route_coordinates:
            return 0
        
        # Simple route risk based on distance and area
        # In real implementation, this would use SA crime data, road conditions, etc.
        adjustment = 0
        
        # Distance factor (longer routes = higher risk)
        if len(route_coordinates) > 100:  # Long route
            adjustment += 5
        
        # This would normally check against SA crime hotspot data
        # For now, simulate based on coordinate patterns
        for coord in route_coordinates[:10]:  # Check first 10 points
            lat, lng = coord.get('lat', 0), coord.get('lng', 0)
            
            # Simulate high-crime areas in major SA cities
            # Johannesburg CBD area (rough coordinates)
            if -26.25 <= lat <= -26.15 and 28.0 <= lng <= 28.1:
                adjustment += 8
            # Cape Town high-risk areas
            elif -33.95 <= lat <= -33.85 and 18.4 <= lng <= 18.5:
                adjustment += 6
            
        return min(20, adjustment)  # Cap at 20 points
    
    def _get_risk_level(self, risk_score):
        """Convert risk score to level"""
        if risk_score < 25:
            return 'Low'
        elif risk_score < 50:
            return 'Medium'
        elif risk_score < 75:
            return 'High'
        else:
            return 'Critical'
    
    def _get_sa_holidays(self):
        """Get South African public holidays"""
        # Simplified - in production, use holidays library
        holidays_data = [
            {'holiday': 'new_year', 'ds': '2024-01-01'},
            {'holiday': 'human_rights_day', 'ds': '2024-03-21'},
            {'holiday': 'freedom_day', 'ds': '2024-04-27'},
            {'holiday': 'workers_day', 'ds': '2024-05-01'},
            {'holiday': 'youth_day', 'ds': '2024-06-16'},
            {'holiday': 'national_womens_day', 'ds': '2024-08-09'},
            {'holiday': 'heritage_day', 'ds': '2024-09-24'},
            {'holiday': 'day_of_reconciliation', 'ds': '2024-12-16'},
            {'holiday': 'christmas_day', 'ds': '2024-12-25'},
            {'holiday': 'day_of_goodwill', 'ds': '2024-12-26'}
        ]
        
        df = pd.DataFrame(holidays_data)
        if not df.empty:
            df['ds'] = pd.to_datetime(df['ds'])
        return df
    
    def load_model(self):
        """Load saved model"""
        try:
            if os.path.exists(self.model_path):
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                self.is_fitted = True
                logger.info(f"Prophet model loaded: {self.model_type}")
                return True
            else:
                # Train a new model if none exists
                logger.info("No saved model found, training new model...")
                return self.train()
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False
    
    def get_model_info(self):
        """Get model information"""
        return {
            'model_type': self.model_type,
            'is_fitted': self.is_fitted,
            'model_path': self.model_path,
            'last_updated': datetime.now().isoformat()
        }

# Initialize models
weather_model = RiskProphetModel('weather_risk')
crime_model = RiskProphetModel('crime_risk')

def initialize_models():
    """Initialize all Prophet models"""
    logger.info("Initializing Prophet models...")
    
    # Initialize weather risk model
    weather_success = weather_model.load_model()
    
    # Initialize crime risk model (using different parameters)
    crime_success = crime_model.load_model()
    
    return weather_success and crime_success

def get_risk_prediction(route_data, weather_data, days_ahead=7):
    """Get comprehensive risk prediction"""
    try:
        # Get weather-based predictions
        weather_risk = weather_model.predict_route_risk(
            route_data.get('coordinates', []),
            weather_data
        )
        
        # Get time-series predictions
        future_predictions = weather_model.predict(days_ahead)
        
        return {
            'current_risk': weather_risk,
            'future_predictions': future_predictions,
            'model_info': {
                'weather_model': weather_model.get_model_info(),
                'prediction_timestamp': datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting risk prediction: {e}")
        return {
            'current_risk': {'risk_score': 50, 'risk_level': 'Medium'},
            'future_predictions': [],
            'error': str(e)
        }

if __name__ == "__main__":
    # Test the models
    print("Testing Prophet Models...")
    initialize_models()
    
    # Test prediction
    test_route = {
        'coordinates': [
            {'lat': -26.2041, 'lng': 28.0473},  # Johannesburg
            {'lat': -26.1076, 'lng': 28.0567}   # Sandton
        ]
    }
    
    test_weather = {
        'temperature': 25,
        'precipitation': 5,
        'wind_speed': 15,
        'visibility': 8
    }
    
    result = get_risk_prediction(test_route, test_weather)
    print(json.dumps(result, indent=2))