from kivymd.app import MDApp
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.button import MDRaisedButton
from kivymd.uix.textfield import MDTextField
from kivymd.uix.label import MDLabel
from kivy.uix.scrollview import ScrollView
from kivy.core.window import Window
import random
import ipaddress
import yaml

# Load explanations from YAML file
with open("explanations.yaml", "r") as stream:
    try:
        explanations = yaml.safe_load(stream)
    except yaml.YAMLError as exc:
        print(exc)


class IPCheckerApp(MDApp):
    def build(self):
        self.title = "IP-Adressprüfer"
        self.layout = MDBoxLayout(orientation="vertical")
        self.theme_cls.theme_style = "Dark"
        self.result_label = MDLabel(size_hint_y=None, height=10 * 20)
        self.result_label.bind(texture_size=self.result_label.setter("size"))
        self.result_scroll = ScrollView(size_hint=(1, None), height=10 * 20)
        self.result_scroll.add_widget(self.result_label)
        self.generate_new_task()
        self.layout.add_widget(self.result_scroll)
        return self.layout

    def generate_new_task(self):
        ip = f"{random.randint(1, 223)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}"
        prefixlen = random.randint(8, 30)
        self.ip_interface = f"{ip}/{prefixlen}"
        ip_label = MDLabel(
            text=f"Generierte IP und Subnetz: {self.ip_interface}",
            theme_text_color="Custom",
            text_color=(1, 1, 1, 1),  # White color in RGBA format
            font_style="H5",  # This corresponds to a font size of 24sp
            bold=True,
            halign="center",
        )
        self.layout.add_widget(ip_label)
        self.add_entries()

    def add_entries(self):
        self.entries = {}
        entry_list = []
        for label_text in [
            "Blockgröße",
            "Netzwerkadresse",
            "Netzwerkmaske",
            "Anzahl von IPs",
            "Anzahl von Hosts",
            "Erster Host",
            "Letzter Host",
            "Broadcast-Adresse",
        ]:
            row_layout = MDBoxLayout()
            row_layout.add_widget(MDLabel(text=f"{label_text}:"))
            entry = MDTextField(input_type="text")
            entry.bind(focus=self.on_focus)
            entry_list.append(entry)
            self.entries[label_text] = entry
            row_layout.add_widget(entry)
            self.layout.add_widget(row_layout)

        # Set up tab navigation
        for i, entry in enumerate(entry_list):
            entry.bind(focus=self.on_focus)
        self.entry_list = entry_list  # Store the list for later use

        button_layout = MDBoxLayout(spacing=20)
        check_button = MDRaisedButton(text="Prüfen")
        check_button.bind(on_press=self.check_values)
        button_layout.add_widget(check_button)

        new_task_button = MDRaisedButton(text="Neue Aufgabe")
        new_task_button.bind(on_press=self.new_task)
        button_layout.add_widget(new_task_button)

        # Add the button layout to the main layout
        self.layout.add_widget(button_layout)

    def on_focus(self, instance, value):
        if value:  # Only consider when a text field gains focus
            self.current_index = self.entry_list.index(instance)  # Update current index
            Window.bind(on_key_down=self.on_key_down)

    def on_key_down(self, instance, keyboard, keycode, text, modifiers):
        if keycode == 40:  # 40 is the keycode for the Tab key
            next_index = (self.current_index + 1) % len(self.entry_list)
            self.entry_list[next_index].focus = True
            return True  # Consume the event to prevent default behavior
        return False  # Continue with the default behavior otherwise

    def new_task(self, instance):
        for widget in list(self.layout.children):
            self.layout.remove_widget(widget)
        self.generate_new_task()

    def check_values(self, instance):
        try:
            user_values = {
                key: int(entry.text) if entry.text.isdigit() else entry.text
                for key, entry in self.entries.items()
            }
        except ValueError:
            self.result_label.text = "Bitte alle Felder ausfüllen."
            return

        (
            blocksize,
            network_address,
            netmask,
            num_ips,
            num_hosts,
            first_host,
            last_host,
            broadcast,
        ) = self.calculate_values(self.ip_interface)

        result = ""
        errors = 0

        for label_text, correct_value, explanation_key in [
            ("Blockgröße", blocksize, "blocksize"),
            ("Netzwerkadresse", network_address, "network_address"),
            ("Netzwerkmaske", netmask, "netmask"),
            ("Anzahl von IPs", num_ips, "num_ips"),
            ("Anzahl von Hosts", num_hosts, "num_hosts"),
            ("Erster Host", first_host, "first_host"),
            ("Letzter Host", last_host, "last_host"),
            ("Broadcast-Adresse", broadcast, "broadcast"),
        ]:
            user_value = user_values[label_text]
            if user_value != correct_value:
                result += f"Falsche {label_text}. Korrekt ist {correct_value}\n"
                result += f"Erklärung: {explanations[explanation_key]}\n=======================\n"
                errors += 1

        if errors == 0:
            result += "Alles ist korrekt! Gut gemacht! 🌟"
        else:
            result += (
                "\nMach dir keine Sorgen, jeder macht Fehler. Versuch es erneut! 💪"
            )

        self.result_label.text = result

    def calculate_values(self, ip_interface):
        network = ipaddress.IPv4Network(ip_interface, strict=False)
        blocksize = 2 ** (8 - (network.prefixlen % 8))
        if blocksize == 256:
            blocksize = 1
        network_address = str(network.network_address)
        netmask = str(network.netmask)
        num_ips = network.num_addresses
        num_hosts = num_ips - 2 if num_ips > 2 else 0
        first_host = str(network.network_address + 1) if num_hosts > 0 else None
        last_host = str(network.broadcast_address - 1) if num_hosts > 0 else None
        broadcast = str(network.broadcast_address)

        return (
            blocksize,
            network_address,
            netmask,
            num_ips,
            num_hosts,
            first_host,
            last_host,
            broadcast,
        )


if __name__ == "__main__":
    IPCheckerApp().run()
