from kivymd.app import MDApp
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.button import MDRaisedButton
from kivymd.uix.textfield import MDTextField
from kivymd.uix.label import MDLabel
from kivy.uix.scrollview import ScrollView
from kivy.core.window import Window
import random
import ipaddress
import math
import yaml

# Load explanations from YAML file
with open("explanations.yaml", "r") as stream:
    try:
        explanations = yaml.safe_load(stream)
    except yaml.YAMLError as exc:
        print(exc)


class SubnettingApp(MDApp):
    def build(self):
        self.title = "IPv4 Subnetting Übung"
        self.theme_cls.theme_style = "Dark"
        self.layout = MDBoxLayout(orientation="vertical")
        self.result_label = MDLabel(
            size_hint_y=None, height=10 * 20
        )  # 20 pixels per line
        self.result_label.bind(texture_size=self.result_label.setter("size"))
        self.result_scroll = ScrollView(
            size_hint=(1, None), height=10 * 20
        )  # 20 pixels per line
        self.result_scroll.add_widget(self.result_label)
        self.new_task()
        self.layout.add_widget(self.result_scroll)
        return self.layout

    def new_task(self):
        ip = f"{random.randint(1, 223)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}"
        prefixlen = random.randint(8, 28)
        self.network = ipaddress.IPv4Network(f"{ip}/{prefixlen}", strict=False)
        self.num_subnets = random.randint(2, 8)
        task_label = MDLabel(
            text=f"Netzwerk: {self.network}, Anzahl der Subnetze: {self.num_subnets}",
            theme_text_color="Custom",
            text_color=(1, 1, 1, 1),
            font_style="H5",
            bold=True,
            halign="center",
        )
        task_label.font_size = 24 * 1.2  # 120% of 24sp
        self.layout.add_widget(task_label)
        self.add_entries()

    def add_entries(self):
        self.entries = {}
        self.entry_list = []
        entry_labels = [
            "Subnetz CIDR",
            "Dezimale Subnetzmaske",
            "Maximale Anzahl von Hosts",
            "Erste Subnetzadresse",
            "Zweite Subnetzadresse",
            "Letzte Subnetzadresse",
        ]
        for label_text in entry_labels:
            row_layout = MDBoxLayout()
            row_layout.add_widget(MDLabel(text=f"{label_text}:"))
            entry = MDTextField(input_type="text")
            entry.bind(focus=self.on_focus)
            self.entry_list.append(entry)  # Add entry to the list
            self.entries[label_text] = entry
            row_layout.add_widget(entry)
            self.layout.add_widget(row_layout)

        button_layout = MDBoxLayout(spacing=10)
        check_button = MDRaisedButton(text="Prüfen")
        check_button.bind(on_press=self.check_values)
        button_layout.add_widget(check_button)

        new_task_button = MDRaisedButton(text="Neue Aufgabe")
        new_task_button.bind(on_press=self.new_task)
        button_layout.add_widget(new_task_button)

        self.layout.add_widget(button_layout)

    def on_focus(self, instance, value):
        if value:
            self.current_index = self.entry_list.index(instance)
            Window.bind(on_key_down=self.on_key_down)

    def on_key_down(self, instance, keyboard, keycode, text, modifiers):
        if keycode == 40:  # 40 is the keycode for the Tab key
            next_index = (self.current_index + 1) % len(self.entry_list)
            self.entry_list[next_index].focus = True
            return True  # Consume the event to prevent default behavior
        return False  # Continue with the default behavior otherwise

    def check_values(self, instance):
        # Your logic for checking values goes here
        pass

    def calculate_values(self, network, num_subnets):
        # Your logic for calculating values goes here
        pass


if __name__ == "__main__":
    SubnettingApp().run()
