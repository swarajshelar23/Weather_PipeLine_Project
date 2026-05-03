import java.util.*;

class WeatherAlert {
    String city;
    double temperature;
    String level; // LOW, NORMAL, HIGH, EXTREME

    WeatherAlert(String city, double temp) {
        this.city = city;
        this.temperature = temp;
        if (temp < 0)        this.level = "❄️  EXTREME COLD";
        else if (temp < 15)  this.level = "🌡️  LOW";
        else if (temp < 35)  this.level = "✅  NORMAL";
        else if (temp < 42)  this.level = "🔥  HIGH";
        else                 this.level = "🚨  EXTREME HEAT";
    }

    @Override
    public String toString() {
        return String.format("%-15s | %5.1f°C | %s", city, temperature, level);
    }

}

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Weather Alert Engine Started ===\n");

        List<double[]> data = Arrays.asList(
            new double[]{28.5},  // Mumbai
            new double[]{-3.2},  // Delhi (winter)
            new double[]{44.1},  // Rajasthan
            new double[]{18.0},  // Bangalore
            new double[]{38.7}   // Chennai
        );
        String[] cities = {"Mumbai", "Delhi", "Rajasthan", "Bangalore", "Chennai"};

        System.out.printf("%-15s | %7s | %s%n", "City", "Temp", "Alert Level");
        System.out.println("-".repeat(50));

        int alerts = 0;
        for (int i = 0; i < cities.length; i++) {
            WeatherAlert alert = new WeatherAlert(cities[i], data.get(i)[0]);
            System.out.println(alert);
            if (alert.level.contains("EXTREME") || alert.level.contains("HIGH")) alerts++;
        }

        System.out.println("-".repeat(50));
        System.out.println("Total alerts triggered: " + alerts);

        // Self-test
        WeatherAlert test = new WeatherAlert("TestCity", 44.5);
        assert test.level.contains("EXTREME") : "Alert level test failed!";
        System.out.println("\n✅ Alert engine self-test passed");
        System.out.println("=== Java Alert Engine Done ===");
    }
}