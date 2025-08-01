// src/ml/analyzers/aiAnalyzer.js - Bedrock Claude Integration
import { AnthropicBedrock } from '@anthropic-ai/sdk';

class AIAnalyzer {
    constructor() {
        try {
            this.claude = new AnthropicBedrock({
                // AWS credentials automatically picked up from environment
                // or ~/.aws/credentials or IAM roles
                region: process.env.AWS_REGION || 'us-east-1'
            });
            this.available = true;
            console.log('🤖 Claude AI: ENABLED via AWS Bedrock');
        } catch (error) {
            this.available = false;
            console.log(`🤖 Claude AI: DISABLED (${error.message.substring(0, 50)}...)`);
        }
    }

    async analyzeRisk(predictions, routeInfo) {
        if (!this.available) {
            return this.getFallbackAnalysis(predictions, routeInfo);
        }

        try {
            const prompt = this.buildAnalysisPrompt(predictions, routeInfo);
            
            const message = await this.claude.messages.create({
                model: "anthropic.claude-3-haiku-20240307-v1:0", // Fastest model for hackathon
                max_tokens: 200,
                temperature: 0.3, // Conservative for consistent analysis
                messages: [{
                    role: "user",
                    content: prompt
                }]
            });

            const aiInsight = message.content[0].text.trim();
            
            return {
                analysis: aiInsight,
                poweredBy: "Claude AI via AWS Bedrock",
                confidence: "high",
                responseTime: "real-time"
            };

        } catch (error) {
            console.log(`⚠️ Claude AI failed: ${error.message}`);
            return this.getFallbackAnalysis(predictions, routeInfo);
        }
    }

    buildAnalysisPrompt(predictions, routeInfo) {
        return `You are a South African travel risk expert. Analyze this route intelligently:

ROUTE: ${routeInfo.start} → ${routeInfo.destination}
VEHICLE: ${routeInfo.vehicle || 'Unknown'}

RISK SCORES:
• Weather Risk: ${predictions.weather_risk?.toFixed(0) || 'N/A'}%
• Crime Risk: ${predictions.crime_risk?.toFixed(0) || 'N/A'}%  
• Accident Risk: ${predictions.accident_risk?.toFixed(0) || 'N/A'}%
• Theft Risk: ${predictions.theft_risk?.toFixed(0) || 'N/A'}%
• Overall: ${predictions.composite_risk?.toFixed(0) || 'N/A'}%

Provide:
1. ONE sentence identifying the primary concern
2. ONE specific South African context reason why
3. ONE actionable recommendation

Be concise, practical, and show local expertise. Focus on the highest risk factor.`;
    }

    getFallbackAnalysis(predictions, routeInfo) {
        // Smart rule-based analysis when Claude is unavailable
        const risks = {
            weather: predictions.weather_risk || 0,
            crime: predictions.crime_risk || 0,
            accident: predictions.accident_risk || 0,
            theft: predictions.theft_risk || 0
        };

        const topRisk = Object.keys(risks).reduce((a, b) => 
            risks[a] > risks[b] ? a : b
        );
        const riskValue = risks[topRisk];

        const insights = {
            weather: `Weather risk is elevated (${riskValue.toFixed(0)}%). South African thunderstorms can produce destructive hail and flash flooding, particularly during summer months.`,
            
            crime: `Crime risk is significant (${riskValue.toFixed(0)}%). This route passes through areas with elevated vehicle crime rates, especially for the current time and vehicle type.`,
            
            accident: `Accident probability is concerning (${riskValue.toFixed(0)}%). Traffic conditions, road infrastructure, and driver behavior patterns increase collision risk on this route.`,
            
            theft: `Vehicle theft risk is high (${riskValue.toFixed(0)}%). Your vehicle type is frequently targeted by criminals in this area, particularly during certain times.`
        };

        const recommendations = {
            weather: "Monitor weather updates closely and consider delaying travel until conditions improve",
            crime: "Travel during daylight hours, avoid stopping unnecessarily, and stay alert in high-risk zones",
            accident: "Reduce speed, maintain safe following distances, and stay focused on defensive driving",
            theft: "Use secure parking facilities and avoid leaving valuables visible in the vehicle"
        };

        return {
            analysis: `${insights[topRisk]} Recommendation: ${recommendations[topRisk]}.`,
            poweredBy: "Advanced Rule-based Analysis",
            confidence: "medium",
            primaryRisk: topRisk
        };
    }

    // Test Claude connection
    async testConnection() {
        if (!this.available) {
            return { success: false, reason: "Claude not initialized" };
        }

        try {
            const testMessage = await this.claude.messages.create({
                model: "anthropic.claude-3-haiku-20240307-v1:0",
                max_tokens: 50,
                messages: [{
                    role: "user",
                    content: "Respond with 'Claude AI connected successfully' if you can read this."
                }]
            });

            return {
                success: true,
                response: testMessage.content[0].text.trim(),
                model: "claude-3-haiku"
            };

        } catch (error) {
            return {
                success: false,
                reason: error.message
            };
        }
    }
}

export default AIAnalyzer;